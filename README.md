budgetBuddy
===========

An API for more intuitive access to NYC Budget Data, current and historical

The supporting schedules for each budget contain a treasure trove of data, down to the lowest level.  http://www.nyc.gov/html/omb/downloads/pdf/ss5_14.pdf

These PDFs are raw output from whatever budget system the city uses, and are very well structured making scraping much simpler.

The immediate goal of this project is to scrape current and historical budget docs, move the data into a database, and build an intuitive REST api for querying different facets of the NYC budget.

...

### How to run the parser

`python parse.py all.txt > out.csv`

You can use [csv2sqlite3](https://github.com/talos/csv2sqlite3) to convert the
CSV to sqlite.

`csv2sqlite3 out.csv`

### Sample queries

If you're in the `db-included` branch, the sqlite database is included, and you
can do queries on it immediately!

```
    $ sqlite3 out.db
    sqlite> select DESCRIPTION, SUM(value) from out where agency_name = 'DEPARTMENT OF EDUCATION' and key = '# POS' and budget_period = 'EXECUTIVE BUDGET FY15' and `inc/dec` is NULL GROUP BY DESCRIPTION;

    description                     SUM(value)
    ------------------------------  ----------
    FULL TIME PEDAGOGICAL PRSONNEL  77206
    FULL TIME PEDAGOGICAL PRSONNEL  3990
    FULL YEAR POSITIONS             10245
    ULL TIME PEDAGOGICAL PRSONNEL   865
    ULL YEAR POSITIONS              203
```

Pretty close to the Departent of Education's website, which claims [75,000
teachers](http://schools.nyc.gov/AboutUs/default.htm)!

```
    select sum(value) from out where budget_period = 'EXECUTIVE BUDGET FY15' and `inc/dec` is null and key = 'AMOUNT' and value > 0;

    69276079561
```

$69 billion is a lot, but it looks like we're still about [six billion
short](http://www.therepublic.com/view/story/fdb1b34d1c6943d4bfcce37b63fb5491/US--NYC-Budget)
of where we should be!


```
    sqlite> select agency_name, sum(value) from out where budget_period = 'EXECUTIVE BUDGET FY15' and `inc/dec` is null and key = 'AMOUNT' group by agency_name order by sum(value) DESC LIMIT 20;

    agency_name                               sum(value)
    ----------------------------------------  --------------------
    DEPARTMENT OF EDUCATION                   17950883486
    MISCELLANEOUS                             9146672075
    DEPARTMENT OF SOCIAL SERVICES             8429344482
    PENSION CONTRIBUTIONS                     8347773377
    POLICE DEPARTMENT                         3936210150
    ADMIN FOR CHILDREN'S SERVICES             2511523424
    DEBT SERVICE                              2482073836
    FIRE DEPARTMENT                           1505377262
    DEPARTMENT OF SANITATION                  1438362228
    DEPARTMENT OF HEALTH AND MENTAL HYGIENE   1103715812
    DEPARTMENT OF CITYWIDE ADMIN SERVICE      1010304949
    DEPARTMENT OF CORRECTION                  904694696
    DEPARTMENT OF HOMELESS SERVICES           867260216
    CITY UNIVERSITY OF NEW YORK               811765755
    DEPARTMENT OF TRANSPORTATION              594767881
    DEPARTMENT OF ENVIRONMENTAL PROTECT.      470556356
    DEPARTMENT OF INFO TECH & TELECOMM        380894315
    HOUSING PRESERVATION AND DEVELOPMENT      281762329
    DEPARTMENT OF PARKS AND RECREATION        256381840
    DEPARTMENT OF YOUTH & COMMUNITY DEV       236044590
```

The Department of Education claims a [$24 billion](http://schools.nyc.gov/AboutUs/default.htm)
budget, although a significant portion of that could come from the state and
federal government.

The Department of Social Services had a [$9.3
billion](https://en.wikipedia.org/wiki/New_York_City_Human_Resources_Administration)
budget in 2013, so $8.4 billion is relatively close.

The Police Department's budget has been in the realm of [$3.6
billion](https://en.wikipedia.org/wiki/NYPD), so $3.9 seems pretty close, too.

When querying, make sure to include `budget_period = 'EXECUTIVE BUDGET FY15 and
`inc/dec` IS NULL` in order to query the most recent budget for absolute
numbers, rather than increases/decreases.  You may also want to include `amount > 0`,
as there are some negative lines in there!

You'll also want to limit by `key = '# POS'` if you're looking up employment
counts, `key = 'AMOUNT'` if you're looking up spending, and `key = #CNTRCT`
if you're looking up numbers of contracts.

```
    sqlite> select distinct key from out;
    # POS
    AMOUNT
    # CNTRCT
```

How much does NYC plan to spend on books next year?

```
    sqlite> select sum(value) from out where DESCRIPTION LIKE '%BOOKS%' AND key='AMOUNT' and budget_period = 'EXECUTIVE BUDGET FY15' and `inc/dec` is NULL;
    11750856
```
