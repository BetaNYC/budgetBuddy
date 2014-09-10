BudgetBuddy
===========

An API for more intuitive access to NYC Budget Data, current and historical

The immediate goal of this project is to scrape current and historical budget
docs, move the data into a database, and build an intuitive REST api for
querying different facets of the NYC budget.

### Get started

This project requires you to install Ruby and Postgres. On a Mac, you can run

#### Requirements

First, install RVM:

```bash
$ curl -sSL https://get.rvm.io | bash -s stable --ruby
```

Next, install Ruby 2.1.1.

```bash
$ rvm install 2.1.1
```

Next, create a gemset for the project:

```bash
$ rvm use 2.1.1
$ rvm gemset create budgetbuddy
```

Finally, install the dependencies and run the setup script, which should download the data and prepare it for yoru environment.

```
$ brew bundle
$ bundle install
$ rake setup_dev
$ rails s
```

Now you can navigate to [http://localhost:3000/]() and take a look at a year's worth of data.  You can change the year to look at
other times in the set.


### Details

The supporting schedules for each budget contain a treasure trove of data, down to the lowest level.

  http://www.nyc.gov/html/omb/downloads/pdf/ss5_14.pdf

These PDFs are raw output from whatever budget system the city uses, and are
very well structured making scraping much simpler.



