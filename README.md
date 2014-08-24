BudgetBuddy
===========

An API for more intuitive access to NYC Budget Data, current and historical

The supporting schedules for each budget contain a treasure trove of data, down to the lowest level.

  http://www.nyc.gov/html/omb/downloads/pdf/ss5_14.pdf

These PDFs are raw output from whatever budget system the city uses, and are
very well structured making scraping much simpler.

The immediate goal of this project is to scrape current and historical budget
docs, move the data into a database, and build an intuitive REST api for
querying different facets of the NYC budget.

...

### Demo Server

You can use the bundled sample server to preview the data in the browser, if
you wish. Make sure to grab the submodules first, then you'll be able to
convert the text file to SQL for the server.

```
$ bundle install
$ rake setup_dev
$ rails s
```

Now you can navigate to [http://localhost:3000/api/v1/2014/budget/op.json?all=true]() and take a look at a year's worth of data.  You can change the year to look at
other times in the set.
