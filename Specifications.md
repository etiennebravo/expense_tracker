# Brief
This is an app that allows the user to keep track of basic finances such as income and expenses. The app will allow the user to generate a summary of their transactions based on a desired timeframe such as a week, month or year.

## Specifications
1. Users are able to create an account to keep track of their personal transactions. Users will be required to register before entering, this is due to the app not being designed to have non-registered users.

2. When entering the index, registered users should see a finantial summary of the current month. It will display at minimum their current expenses, montly earnings and current balance (earning minus expenses).

3. Users are able to register their payment methods and set a name. This is done to be able to keep track of individual transactions and tie them to a specific payment method. The form must include:
    * A name for the method.
    * A type such as card, savings account or checking account.
    * The bank to which it belongs to.

4. Users are able to register transactions and put them under a selected payment method. For the sake of simplicity, the transactions are to be entered manually through a form that must include the following fields:
    * Transaction type: Income or expense.
    * A category: Such as groceries, entertainment, or gas (more categories to be added in the future).
    * Payment method used: User can select from their registered forms of payment or cash.
    * An amount in US dollars.
    * The users can set an expense to repeat every certain amount of time (weekly, monthly or yearly) so that it can be tracked automatically.

5. Users can access a detailed view of their transactions. The view must include:
    * A field so users can set the timeframe that is used (weekly, monthly or yearly) and the page should display a table with all of the transactions made within the timeframe.
    * User should be able to also filter their table by payment method.
    * In the table view, users should also be able to delete or modify their transactions.
    * If the table exceedes more than 15 elements in the table, use pagination to keep the table from growing too large.
    * The table must include a button to add another transaction.
    * Visual aid to help the user. (Graphs or summaries).

6. The html and css should fully support a cellphone view. This will allow users from mobile devices to use the app. The page should also use JS when necessary to update values without a page reload.

7. Since the page contains sensitive information, no user should be able to modify or access other users data.