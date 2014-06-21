#!/usr/bin/env python

#import csv
import traceback
import sys
import re
from pprint import pprint


class OperatingBudgetParser(object):

    def __init__(self):
        self.classification = {}
        self.columns = u''
        self.column_dashes = u''
        self.supercolumns = u''
        self.supercolumn_dashes = u''

    def line2dict(self, line):
        """
        Convert line to dict via current columns.
        """
        start = 0
        data = {}
        last_colname = ''
        for match in re.finditer(r'\s+|$', self.column_dashes):
            end = match.end()

            colname = self.columns[start:end].strip()
            value = line[start:end].strip()
            if not colname:
                continue

            if colname in (u'# CNTRCT', u'# POS', u'AMOUNT'):

                # For these columns, the value may be considerably offset
                # off of the column headers.
                if value == '':
                    # No value under column header, look ahead
                    match = re.search(r'(\S+)\s', line[end:])
                    if match:
                        value = match.group(1)
                elif len(line) > end and line[end] != ' ':
                    # Value continues
                    match = re.search(r'(\S+)\s', line[end:])
                    if match:
                        value = value + match.group(1)

                period = self.supercolumns[0]
                if (period, colname) in data.keys():
                    period = self.supercolumns[1]
                    if (period, colname) in data.keys():
                        colname = (period, 'INC/DEC', colname)
                    else:
                        colname = (period, colname)
                else:
                    colname = (period, colname)

                # Use second part of value, in case it spilled out
                if len(value.split()) > 1:
                    value = value.split()[1]

            data[colname] = value

            # Delete redundant data
            if last_colname and data[last_colname] == value:
                del data[last_colname]
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
            classification[u'agency'] = (fields[1], u' '.join(fields[3:]))

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
            data.update(extra)
            pprint({
                'classification': classification,
                'data': data
            })


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
                traceback.print_exc()
                print e
                import pdb
                pdb.set_trace()


if __name__ == '__main__':
    scrape(open(sys.argv[1], 'r'))
