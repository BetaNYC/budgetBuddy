#!/usr/bin/python

import os, sys
import time
import csv, sqlite3, argparse

def convert(csvpath, dbpath=None, tablename=None, sqlpath=None, guessdatatypes=True,
			samplesize=1000, verbosity=0):

	start = time.time()

	# /path/file.csv -> /path/file.db
	if not dbpath:
		dbpath = '%s.db' % os.path.splitext(csvpath)[0]

	# /path/file.csv -> file
	if not tablename:
		tablename = os.path.basename(os.path.splitext(csvpath)[0])

	# /path/file.csv -> /path/tablename.sql
	if not sqlpath:
		sqlpath = os.path.join(os.path.dirname(csvpath), '%s.sql' % tablename)

	with open(csvpath, 'rb') as f:
		
		sample = ''
		for i, line in enumerate(f):
		    sample = sample + line
		    if i >= samplesize:
		        break
		f.seek(0)

		# sniff the sample data to guess the delimeters, etc
		dialect = csv.Sniffer().sniff(sample)
		has_header = csv.Sniffer().has_header(sample)

		# column names are either in the first (header) row or c0, c1, c2 if there is not header row
		fieldnames = [x if has_header else 'c%s'%i for i,x in enumerate(csv.reader(f, dialect=dialect).next())]
		f.seek(0)

		# prepare the reader and skip the header row
		r = csv.reader(f, dialect=dialect)
		if has_header:
			r.next()

		# guess the fieldtypes (though, without a `max` parameter, everything will be `TEXT`)
		fieldtypes = guess_datatypes(r, 1000) if guessdatatypes else ["TEXT"] * len(fieldnames)
		f.seek(0)

		# skip the header row
		if has_header:
			r.next()
		
		# write the SQL file if it doesn't exist
		if not os.path.exists(sqlpath):
			with open(sqlpath, 'wb') as w:
				w.write('CREATE TABLE IF NOT EXISTS `%s` (%s);' % (tablename, ','.join(['\n\t`%s`\t%s' % (n, t) for (n, t) in zip(fieldnames, fieldtypes)]) + '\n'))

		# connect to database
		with sqlite3.connect(dbpath) as conn:
			conn.text_factory = str
			c = conn.cursor()

			# conditional create
			sql_create = open(sqlpath, 'r').read()
			c.execute(sql_create)

			# insert csv values
			sql_insert = 'INSERT INTO `%s` VALUES (%s);' % (tablename, ','.join(['?']*len(fieldnames)))
			for i, row in enumerate(r):
				if verbosity and i % verbosity == 0:
					sys.stdout.write("Inserted {0} rows in {1} seconds\n".format( i, time.time() - start))
				try:
					c.execute(sql_insert, [x if len(x)>0 else None for x in row] if guessdatatypes else row)
				except Exception as e:
					sys.stderr.write(u"Could not import row {0} ({1}):\n{2}".format(
						i, e, row))
				total_rows = i

			if verbosity:
				sys.stdout.write("Complete: inserted {0} rows in {1} seconds\n".format(
					total_rows, time.time() - start))


def guess_datatypes(csvreader, max=100):
	types = []
	for r, row in enumerate(csvreader):
		if len(types) == 0:
			types.extend([[int, long, float, str]] * len(row))
		if r >= max:
			break
		for c, cell in enumerate(row):
			try:
				types[c] = [x for x in types[c] if try_parse(cell, x)]
			except IndexError as e:
				sys.stderr.write(u"Wrong number of columns sniffing row {0} "
								 u"(expected {1}, got {2}): ({3}):\n{4}".format(
								 r, len(types), len(row), e, row))

	conversion = {int:"INTEGER",long:"INTEGER",float:"REAL",str:"TEXT"}

	return [conversion[x[0]] for x in types]

def try_parse(str, typ):
	if len(str) == 0:
		return True
	try:
		typ(str)
		return True
	except:
		return False

if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='Converts a CSV file to a SQLite3 database')
	parser.add_argument("csv_file", help="path to CSV file")
	parser.add_argument('-d', '--db_file', help='path to SQLite3 database file')
	parser.add_argument('-t', '--table_name', help='name of the table')
	parser.add_argument('-s', '--sql_create', help='path to CREATE TABLE .sql file')
	parser.add_argument('-n', '--naive_datatypes', action="store_true", default=False, help='don''t guess datatypes (everything is TEXT, no NULLs)')
	parser.add_argument('-z', '--sample_size', default=1000, help='how many rows to search to guess datatypes')
	parser.add_argument('-v', '--verbosity', type=int, default=0, help='print to STDOUT info every VERBOSITY lines of import')
	args = parser.parse_args()

	convert(args.csv_file, args.db_file, args.table_name, args.sql_create, not args.naive_datatypes,
			args.sample_size, args.verbosity)
