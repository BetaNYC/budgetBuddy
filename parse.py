#!/usr/bin/env python

#import csv
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

    def supercolumn_name(self, i):
        pass

    def line2dict(self, line):
        """
        Convert line to dict via current columns.
        """
        start = 0
        data = {}
        for match in re.finditer(r'\s+|$', self.column_dashes):
            end = match.end()

            # TODO will overwrite duplicate column names, need to look at
            # other headers
            colname = self.columns[start:end].strip()
            data[colname] = line[start:end].strip()
            start = end

    def parse(self, line, fields):
        last_classification = self.classification.copy()
        classification = self.classification
        flush_to_margin = line[0] != ' '

        if fields[0] in (u'SUBTOTAL', u'TOTAL', u'INC/DEC'):
            pass

        elif fields[0:2] == [u'OBJECT', u'CLASS']:
            self.columns = line

        elif fields[0] == u'MODIFIED' and not flush_to_margin:
            self.supercolumns = line

        elif set(line.strip()) == set(['-', ' ']):
            if flush_to_margin:
                self.supercolumn_dashes = line.strip()
            else:
                self.column_dashes = line.strip()

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

        #elif fields[0].isdigit() and flush_to_margin:
        #    classification[u'object_class'] = (
        #        fields[0],
        #        re.match(r'^\d{2} (.+)\s{2,}', line).group(1).strip())

        #elif fields[0].isdigit() and not flush_to_margin:
        #    pass

        else:
            self.line2dict(line)

        if last_classification != classification:
            print classification


class PositionScheduleParser(object):

    def parse(self, line, fields):
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
                parser.parse(line, fields)
            except Exception as e:
                traceback.print_exc()
                print e
                import pdb
                pdb.set_trace()


if __name__ == '__main__':
    scrape(open(sys.argv[1], 'r'))
