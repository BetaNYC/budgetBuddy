#!/usr/bin/env python

from decimal import Decimal
import csv
import traceback
import sys
import re


class OperatingBudgetParser(object):

    def __init__(self):
        self.classification = {}
        self.columns = u''
        self.column_dashes = u''
        self.supercolumns = u''
        self.supercolumn_dashes = u''
        self.csv_writer = csv.DictWriter(sys.stdout, [
            'agency_id', 'agency_name',
            'responsibility_center_id', 'responsibility_center_name',
            'budget_code_id', 'budget_code_name',
            'object_class', 'ic_ref',
            'obj', 'description',
            'budget_period', 'inc/dec', 'key', 'value',
            'file_name', 'source_line'
        ])
        self.csv_writer.writeheader()

    def process_value(self, v):
        """
        Convert values with commas and terminating minus signs to proper format
        """
        if not v:
            return ''
        if v[-1] == '-':
            v = '-' + v[0:-1]
        return Decimal(v.replace(',', ''))

    def output(self, classification, data):
        for k, v in data.items():
            if v:
                self.csv_writer.writerow({
                    'agency_id': classification['agency'][0],
                    'agency_name': classification['agency'][1],
                    'responsibility_center_id': classification['responsibility_center'][0],
                    'responsibility_center_name': classification['responsibility_center'][1],
                    'budget_code_id': classification['budget_code'][0],
                    'budget_code_name': classification['budget_code'][1],
                    'object_class': classification['object_class'],
                    'ic_ref': classification['ic_ref'],
                    'obj': classification['obj'],
                    'description': classification['description'],
                    'file_name': classification['file_name'],
                    'source_line': classification['source_line'],
                    'budget_period': k[0],
                    'key': k[1],
                    'inc/dec': k[2] if len(k) > 2 else '',
                    'value': v
                })

    def line2dict(self, line):
        """
        Convert line to dict via current columns.
        """
        start = 0
        data = {}
        last_colname = ''

        matches = [m for m in re.finditer(r'\s+|$', self.column_dashes)]

        for i, match in enumerate(matches):
            end = match.end()
            next_end = matches[i+1].end() if len(matches) > i + 1 else end

            colname = self.columns[start:end].strip()
            value = line[start:end].strip()
            if not colname:
                pass

            elif colname == 'OBJECT CLASS' and value:
                if self.classification.get('object_class') != value:
                    self.classification['object_class'] = value
                    # Reset ic_ref when object_class changes
                    self.classification['ic_ref'] = ''

            elif colname == 'IC REF' and value:
                self.classification['ic_ref'] = value

            elif colname == 'DESCRIPTION' and value:
                # Sometimes the description column spills over
                if value[-1] == ' ':
                    match = re.search(r'^(\S*(\s\S+)*)(\n|\s{2,})', line[end:])
                    if match and match.group(1):
                        value = value + match.group(1)
                        end = end + len(match.group(1))
                else:
                    match = re.search(r'^(\S+(\s\S+)*)(\n|\s{2,})', line[end:])
                    if match and match.group(1):
                        value = value + match.group(1)
                        end = end + len(match.group(1))
                self.classification['description'] = value

            elif colname == 'OBJ' and value:
                self.classification['obj'] = value

            elif colname in (u'# CNTRCT', u'# POS', u'AMOUNT'):

                # For these columns, the value may be considerably offset
                # off of the column headers.
                if value == '':
                    # No value under column header, look ahead to next column
                    value = line[end:next_end].strip()
                    if len(value.split()) > 1:
                        value = value.split()[0]

                elif len(line) > end and line[end] != ' ':
                    # Value continues into next column
                    match = re.search(r'(\S+)\s', line[end:])
                    if match:
                        value = value + match.group(1)

                period = self.supercolumns[0]
                if (period, colname) in data.keys():
                    period = self.supercolumns[1]
                    if (period, colname) in data.keys():
                        colname = (period, colname, 'INC/DEC')
                    else:
                        colname = (period, colname)
                else:
                    colname = (period, colname)

                # Use second part of value, in case it spilled out
                if len(value.split()) > 1:
                    value = value.split()[1]

                value = self.process_value(value)
                data[colname] = value

                # Delete redundant data if the prior column was a lookahead
                if last_colname and data[last_colname] == value:
                    data[last_colname] = ''

                last_colname = colname

            start = end

        return data

    def parse(self, line, fields, extra=None):
        classification = self.classification
        flush_to_margin = line[0] != ' '
        extra = extra if extra else {}

        if fields[0] in (u'SUBTOTAL', u'TOTAL', u'INC/DEC', u'EXECUTIVE'):
            pass

        elif fields[0:2] == [u'OBJECT', u'CLASS']:
            self.columns = line

        elif fields[0] == u'MODIFIED' and not flush_to_margin:
            self.supercolumns = re.split(r'\s{2,}', line.strip())

        elif set(line.strip()) == set(['-', ' ']):
            if flush_to_margin:
                self.column_dashes = line
            else:
                self.supercolumn_dashes = line

        elif fields[0] == u'AGENCY:':
            classification[u'agency'] = (fields[1], u' '.join(fields[2:]))

        elif fields[0:3] == [u'UNIT', u'OF', u'APPROPRIATION:']:
            classification[u'unit_of_appropriation'] = (fields[3], u' '.join(fields[4:]))

        elif fields[0:2] == [u'RESPONSIBILITY', u'CENTER:'] and flush_to_margin:
            try:
                classification[u'responsibility_center'] = (fields[2], u' '.join(fields[3:]))
            except IndexError:
                classification[u'responsibility_center'] = (u'', u'')

        elif fields[0:2] == [u'BUDGET', u'CODE:'] and flush_to_margin:
            classification[u'budget_code'] = (fields[2], u' '.join(fields[3:]))

        elif len(fields) == 1:
            pass

        else:
            data = self.line2dict(line)
            self.classification.update(extra)
            self.output(classification, data)


class PositionScheduleParser(object):

    def parse(self, line, fields, extra=None):
        # TODO
        pass


def scrape(f):

    parser = None
    position_schedule_parser = PositionScheduleParser()
    operating_budget_parser = OperatingBudgetParser()

    for i, line in enumerate(f):
        fields = line.split()

        if not fields:
            continue

        if fields[0:2] == [u'OPERATING', u'BUDGET']:
            parser = operating_budget_parser

        elif fields[0:2] == [u'POSITION', u'SCHEDULE']:
            parser = position_schedule_parser

        elif fields[0:2] == [u'AGENCY', u'SUMMARY']:
            parser = None

        elif fields[0:4] == [u'UNIT', u'OF', u'APPROPRIATION', u'SUMMARY']:
            parser = None

        elif parser:
            try:
                parser.parse(line, fields, extra={
                    'source_line': i+1,
                    'file_name': f.name
                })
            except Exception as e:
                sys.stderr.write(traceback.format_exc() + u'\n')
                sys.stderr.write(e + u'\n')


if __name__ == '__main__':
    scrape(open(sys.argv[1], 'r'))
