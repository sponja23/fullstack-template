# Domain glossary

## Organization

The tenant that owns every domain record.

_Avoid_: team, workspace, account.

## Client

A company an Organization bills. Its name is unique within the Organization, and its billing currency is fixed when it is created.

_Avoid_: customer, account.

## Project

Work performed for one Client, identified by an Organization-unique slug and billed at an hourly rate in the Client's currency. A Project is either active or archived.

_Avoid_: job, engagement.

## Time entry

A positive number of minutes worked by an Organization member on a Project on a particular date, optionally described by a note. It is unbilled until an invoice line item claims it; a billed Time entry is immutable.

_Avoid_: timesheet, log.
