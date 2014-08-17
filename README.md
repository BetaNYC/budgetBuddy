<<<<<<< HEAD
budgetBuddy
=======
BudgetBuddy
>>>>>>> e560b8c656e16a2d58ca080cad496f7220b7174e
===========

An API for more intuitive access to NYC Budget Data, current and historical

<<<<<<< HEAD
The supporting schedules for each budget contain a treasure trove of data, down
to the lowest level.  [http://www.nyc.gov/html/omb/downloads/pdf/ss5_14.pdf]()
=======
The supporting schedules for each budget contain a treasure trove of data, down to the lowest level.

  http://www.nyc.gov/html/omb/downloads/pdf/ss5_14.pdf
>>>>>>> e560b8c656e16a2d58ca080cad496f7220b7174e

These PDFs are raw output from whatever budget system the city uses, and are
very well structured making scraping much simpler.

The immediate goal of this project is to scrape current and historical budget
docs, move the data into a database, and build an intuitive REST api for
querying different facets of the NYC budget.

...

### Demo Server

You can use the bundled sample server to preview the data in the browser, if
you wish.  Make sure to grab the submodules first, then you'll be able to
convert the text file to SQL for the server.

```
<<<<<<< HEAD
$ git submodule init data
$ git submodule update data
$ python data/bin/csv2sqlite3.py data/processed/all.txt
$ cd tmpserver
$ npm install
$ node server.js
=======
$ npm run setup_dev
$ npm install
$ npm start
>>>>>>> e560b8c656e16a2d58ca080cad496f7220b7174e
```

Now you can navigate to [http://localhost:3000/v1/2012/op/summary.json]() and
take a look at a year's worth of data.  You can change the year to look at
other times in the set.
