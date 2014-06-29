budgetBuddy
===========

An API for more intuitive access to NYC Budget Data, current and historical

The supporting schedules for each budget contain a treasure trove of data, down
to the lowest level.  [http://www.nyc.gov/html/omb/downloads/pdf/ss5_14.pdf][]

These PDFs are raw output from whatever budget system the city uses, and are
very well structured making scraping much simpler.

The immediate goal of this project is to scrape current and historical budget
docs, move the data into a database, and build an intuitive REST api for
querying different facets of the NYC budget.

...

### How to run the parser

`python parse.py all.txt > data/2015.txt`

You can use the bundled [csv2sqlite3](https://github.com/talos/csv2sqlite3) to
convert the CSV to sqlite.

`python bin/csv2sqlite3.py data/2015.txt`

Please note that the file name without the extension will be the table name in sqlite3

So if you make the file name out.txt then the csv2sqlite3 python script will create out.db in the same directory where the source out.txt is.

To make the following queries work you must use these commands:

`python parse.py all.txt > data/out.txt`

`python bin/csv2sqlite3.py data/out.txt`

`sqlite3 data/out.txt`

Also for ubuntu, if you do not have the sqlite3 command, use
`sudo apt-get install sqlite3`


### Sample queries

Once you've created the local SQLite database, you can run queries on it.

```
    $ sqlite3 data/2015.db
    sqlite> select DESCRIPTION, SUM(value) from out where agency_name = 'DEPARTMENT OF EDUCATION' and key = '# POS' and budget_period = 'EXECUTIVE BUDGET FY15' and `inc/dec` is NULL GROUP BY DESCRIPTION;
    description                               SUM(value)
    ----------------------------------------  --------------------
    FULL TIME PEDAGOGICAL PRSONNEL            108959
    FULL YEAR POSITIONS                       10321
    ULL TIME PEDAGOGICAL PRSONNEL             904
    ULL YEAR POSITIONS                        203
```

The Department of Education employs [75,000 teachers](http://schools.nyc.gov/AboutUs/default.htm),
although that count likely doesn't include many "full time pedagogical
personnel".

```
    select sum(value) from out where budget_period = 'EXECUTIVE BUDGET FY15' and `inc/dec` is null and key = 'AMOUNT';
    sum(value)
    ----------------------------------------
    74619472575
```

$74.6 billion is [about where we should be!](http://www.therepublic.com/view/story/fdb1b34d1c6943d4bfcce37b63fb5491/US--NYC-Budget)

```
    sqlite> select agency_name, sum(value) from out where budget_period = 'EXECUTIVE BUDGET FY15' and `inc/dec` is null and key = 'AMOUNT' group by agency_name order by sum(value) DESC LIMIT 20;


    agency_name                               sum(value)
    ----------------------------------------  --------------------
    DEPARTMENT OF EDUCATION                   20436893972
    DEPARTMENT OF SOCIAL SERVICES             9620603993
    MISCELLANEOUS                             9490482227
    PENSION CONTRIBUTIONS                     8353527545
    POLICE DEPARTMENT                         4703668663
    DEBT SERVICE                              4257632151
    ADMIN FOR CHILDREN'S SERVICES             2810722817
    FIRE DEPARTMENT                           1765803243
    DEPARTMENT OF SANITATION                  1483639811
    DEPARTMENT OF HEALTH AND MENTAL HYGIENE   1338227487
    DEPARTMENT OF CITYWIDE ADMIN SERVICE      1115030179
    DEPARTMENT OF ENVIRONMENTAL PROTECT.      1092604893
    DEPARTMENT OF CORRECTION                  1060259177
    DEPARTMENT OF HOMELESS SERVICES           951878443
    CITY UNIVERSITY OF NEW YORK               914985409
    DEPARTMENT OF TRANSPORTATION              800629441
    HOUSING PRESERVATION AND DEVELOPMENT      512759197
    DEPARTMENT OF INFO TECH & TELECOMM        452962565
    DEPARTMENT OF PARKS AND RECREATION        355165362
    DEPARTMENT OF YOUTH & COMMUNITY DEV       340150536
```

The Department of Education claims a [$24 billion](http://schools.nyc.gov/AboutUs/default.htm)
budget, although a significant portion of that could come from the state and
federal government.

The Department of Social Services had a [$9.3
billion](https://en.wikipedia.org/wiki/New_York_City_Human_Resources_Administration)
budget in 2013, so $9.6 billion sounds about right.

The Police Department's budget has been in the realm of [$3.6
billion](https://en.wikipedia.org/wiki/NYPD), so $4.7 seems a bit excessive.

When querying, make sure to include `budget_period = 'EXECUTIVE BUDGET FY15 and
`inc/dec` IS NULL` in order to query the most recent budget for absolute
numbers, rather than increases/decreases.

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
    sum(value)
    ----------------------------------------
    142469594
```

$142M on books!  Who in the city loves to read so much?

```
    sqlite> select agency_name, budget_code_name, description, value from out where DESCRIPTION LIKE '%BOOKS%' AND key='AMOUNT' and budget_period = 'EXECUTIVE BUDGET FY15' and `inc/dec` is NULL order by value desc limit 10;

    agency_name                budget_code_name                     description     value
    -------------------------  -----------------------------------  --------------- ---------------
    DEPARTMENT OF EDUCATION    NYSTL - ELEMENTARY / MIDDLE          BOOKS-OTHER     62135782
    DEPARTMENT OF EDUCATION    NON-PUBLIC SCHOOL PAYMENTS           BOOKS-OTHER     16247770
    DEPARTMENT OF EDUCATION    NYSTL - HIGH SCHOOL                  BOOKS-OTHER     10685076
    DEPARTMENT OF EDUCATION    NYSTL - ELEMENTARY / MIDDLE          LIBRARY BOOKS   7758692
    DEPARTMENT OF EDUCATION    REIMBURSEABLE SUPPORT-GE INST ELE/M  BOOKS-OTHER     6842846
    DEPARTMENT OF EDUCATION    GE INST & SCHOOL SUPERVISION ELE/MI  BOOKS-OTHER     6355113
    DEPARTMENT OF EDUCATION    GE INSTRUCTION & SCHOOL SUPERVISION  BOOKS-OTHER     4698615
    DEPARTMENT OF EDUCATION    GE Central Managed Sch Supp-HS       BOOKS-OTHER     3083980
    DEPARTMENT OF EDUCATION    GE HOLDING CODE - ELEMENTARY / MIDD  BOOKS-OTHER     2803235
    DEPARTMENT OF EDUCATION    NON-PUBLIC SCHOOL PAYMENTS           LIBRARY BOOKS   2069760
```

Elementary and middle schoolers, apparently.

### Demo Server

You can use the bundled sample server to preview the data in the browser, if
you wish.

```
$ cd tmpserver
$ npm install
$ python ../bin/csv2sqlite3.py ../data/2015.db
$ node server.js
```
