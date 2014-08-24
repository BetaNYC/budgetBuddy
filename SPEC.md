Some API Questions:
Our Hierarchy looks like: year/operatingBudget/agency/uoa/responsibilityCenter/budgetCode/objectclass/object

Should we include all subordinate data when a given level is queried?
Should we have a flag for whether the results are roll-up for that level, or include subordinate data?


GET /:year/op = citywide totals with agency rollup
GET /:year/op/detail = full drilldown - this is basically the whole database... no?

GET /:year/op/:agency - just has the totals for the agency and rollups for the next lower element in the hierarchy
GET /:year/op/:agency/detail - full drilldown

GET /:year/op/:agency/:uoa - just this UOA and its children (responsibility centers)
GET /:year/op/:agency/:uoa/detail - full drilldown

...and so on...

Year to Year comparisons?

GET /:year/op/:agency/history?since=2012

Rollup Object Classes at the agency level:

GET /:year/op/:agency/?objectClass=01  This will return the sum of all object class 01 values in this agency
//how do we query multiples?

