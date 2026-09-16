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

## Invoice

An Organization's bill to one Client. It begins as an editable draft with no number; issuing assigns
the next gapless Organization number and claims its Time entries atomically. Its lifecycle is draft →
issued → paid, draft → void, or issued → void, with timestamps recording each transition.

_Avoid_: bill.

## Line item

A child of an Invoice carrying an integer quantity, unit amount, and total in the Invoice currency. A
generated Line item groups selected Time entries for one Project using minutes and its hourly rate; a
manual Line item is entered directly. Line items are never accessed independently of their Invoice.

_Avoid_: line, row, item.
