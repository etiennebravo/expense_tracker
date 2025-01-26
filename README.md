# Capstone: Expense tracker
## Distinctiveness and Complexity:
My project tackles a different problem than previous projects from the course, only vaguely resembling the ecommerce projects because it is an app about currency and transactions, but its purpose is not to buy or sell but rather keep records and inform the user on their spending.

As for the complexity, I tried to implement most of the techniques seen on the course with the addition of react instead of vanilla JS. This change introduces a framework which I had to learn in order to start making progress.

I tried to make the user interface as responsive as I could, so the user does not have to reload the page after making changes to any of its parts and it also gives feedback to the user whenever a change is made.

## Django files
Project was made using the Django framework which contains the models, URLs and views that the application uses to send and receive information. The framework is used to create a CRUD application so that the user has access to a database through the UI.

### models.py
This includes the user model and 2 extra models for transactions and payment methods which all work together to record finances. Every time a user is created, they have one payment method registered: cash. If one of the payment methods is deleted, the transactions remain in the database.

## JS files
The app.js file includes all of the JavaScript to make the user interface a single page web application so that it has no necessity to reload. The code is written using react as the framework, all of the components are included in this file

I made the decision to include the entirety of the react code into one file as I was unable to figure out why the 'import' and 'export' statements were not working and including a separate frontend would make the project not match the file structure of previous projects as required in the instructions.

The application is divided into four main components that show one at a time.
1. The summary presents information on the current month's transactions, how much has the user spent and earned while giving a balance. It also contains the balances of each of the user's payment methods. If the users add a transaction or payment method, this page updates accordingly.

2. The datails component shows a table with all of the transactions made by the user using pagination. The user is able to filter the information to display the desired information. The table includes buttons to edit or delete the transactions, this is done to give more control to the user.

3. The Transaction form is used to create transactions; it presents a form to the user that they can fill.

4. The method form component offers the user a list of their payment methods so that they can create, modify or delete them at command.

As for the 'nav-buttons.js' file, it contains the logic for the navigation bar.

## How to run
1. Open terminal and create a folder for the project and clone the files. \
```mkdir DirectoryName``` \
```git clone https://github.com/etiennebravo/expense_tracker```

2. Navigate to the recently copied project and create a virtual environment for python. \
```cd DirectoryName``` \
```python -m venv env```

3. Initialize the environment. \
```./env/bin/activate```

    If running scripts is giving trouble on windows, change policies. \
    ```Set-ExecutionPolicy Unrestricted -Scope process```

4. Install required packages for python. \
```pip install -r requirements.txt```

5. Initialize a database. \
```python manage.py makemigrations``` \
```python manage.py migrate```

6. Run the project. \
```python manage.py runserver```