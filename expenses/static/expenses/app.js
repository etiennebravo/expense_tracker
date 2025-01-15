const body = document.querySelector('#body');
const bodyRoot = ReactDOM.createRoot(body);
bodyRoot.render(<App />);

function App() {
    const [summaryInfo, setSummaryInfo] = React.useState([]);
    const [methods, setMethods] = React.useState([]);

    React.useEffect(() => {
        fetchSummary();
        fetchMethods();
    }, []);

    function fetchSummary() {
        fetch('/summary')
            .then(response => response.json())
            .then(data => setSummaryInfo(data));
    }

    function fetchMethods() {
        fetch('/list_methods')
            .then(response => response.json())
            .then(data => setMethods(data));
    }

    return (
        <div className="app">
            <Summary summary={summaryInfo} />
            <Details onTransactionEdited={fetchSummary} methods={methods} />
            <TransactionForm onTransactionAdded={fetchSummary} methods={methods} />
            <MethodForm onMethodAdded={fetchMethods} />
        </div>
    );
}

/// Code provided by the quack50 at https://cs50.ai/chat
/// Removes the necessity to make the post requests processed within JS csrf-exempt.

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

/// end of citation

const Spacer = ({ size }) => <div className={`spacer${size}`}></div>;

/////////////// SUMMARY ///////////////////

// Individual summary info component
const SummaryInfo = ({ title, amount, description }) => (
    <div className="summary-info">
        <p>{title}</p>
        <h1>{amount}</h1>
        <p className="light-text">{description}</p>
    </div>
);

const SummaryBalance = ({ title, amount, description }) => (
    <div className="summary-info">
        <p>{title}</p>
        <h1 style={ amount > 0 ? {color: 'green'} : {color: 'red'}}>{amount}</h1>
        <p className="light-text">{description}</p>
    </div>
);

// Summary column component
const SummaryColumn = ({ flexClass, children }) => (
    <div className={`summary-column ${flexClass}`}>
        {children}
    </div>
);

// Summary row component
const SummaryRow = ({ children }) => (
    <div className="summary-row">
        {children}
    </div>
);

// Main summary component
function Summary({ summary }) {
    return (
        <div id="summary">
            <Spacer size="3" />
            <h2>Summary</h2>
            <Spacer size="4" />


            <>
                <SummaryRow>
                    <SummaryColumn flexClass="flex4">
                        <SummaryInfo title="Total monthly expenses" amount={summary.expense_amount} description="" />
                    </SummaryColumn>
                    <SummaryColumn flexClass="flex6">
                        <SummaryInfo title="Monthly Income" amount={summary.income_amount} description="" />
                    </SummaryColumn>
                </SummaryRow>
                <Spacer size="4" />

                <SummaryRow>
                    <SummaryColumn flexClass="flex1">
                        <SummaryInfo title="Total variable expenses" amount={summary.variable_expense_amount} description="One time payments" />
                    </SummaryColumn>
                    <SummaryColumn flexClass="flex1">
                        <SummaryInfo title="Total fixed expenses" amount={summary.fixed_expense_amount} description="Recurring payments" />
                    </SummaryColumn>
                    <SummaryColumn flexClass="flex1">
                        <SummaryBalance title="Balance" amount={summary.balance} description="* The more the better" />
                    </SummaryColumn>
                </SummaryRow>
                <Spacer size="4" />
            </>
            
        </div>
    );
}

///////////// DETAILS /////////////////

const TransactionTableRow = ({ transaction, onTransactionEdited, methods }) => {
    const [editMode, setEditMode] = React.useState(false);
    const [formState, setFormState] = React.useState({
        methodID: transaction.methodID,
        type: transaction.type,
        repeat_interval: transaction.repeat_interval,
        category: transaction.category,
        amount: transaction.amount
    });

    function toggleEditMode() {
        setEditMode(!editMode);
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function formatTimestamp(timestamp) {
        var date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    function handleEdit(event) {
        if (formState.methodID === '' || formState.type === '' || formState.repeat_interval === '' || formState.category === '' || formState.amount === '') {
            event.preventDefault();
            console.log('Form must have content');
            return;
        }

        fetch(`/edit_transaction/${transaction.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(formState)
        })
            .then(response => {
                if (!response.ok) { throw new Error('Network response was not ok'); }
                return response.json();
            })
            .then(method => {
                setFormState({
                    methodID: transaction.methodID,
                    type: transaction.type,
                    repeat_interval: transaction.repeat_interval,
                    category: transaction.category,
                    amount: transaction.amount
                });
                toggleEditMode();
                onTransactionEdited();
            })
            .catch(error => {
                console.error('Fetch operation failed', error);
            });
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormState({
            ...formState,
            [name]: value
        });
    }

    if (editMode) {
        return (
            <tr data-id={transaction.id} data-userid={transaction.userID}>
                <th scope="row">
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleEdit}>&#10003;</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={toggleEditMode}>&#10005;</button>
                </th>
                <td>
                    <select className="form-control" name="methodID" value={formState.methodID} onChange={handleChange} required>
                        {methods.map((method) => (
                            <option key={method.id} value={method.id}> {method.name} </option>
                        ))}
                    </select>
                </td>
                <td>
                    <select className="form-control" name="type" value={formState.type} onChange={handleChange} required>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </td>
                <td>
                    <div className="input-group input-group mb-3">
                        <span className="input-group-text">$</span>
                        <input type="text" className="form-control" name="amount" value={formState.amount} onChange={handleChange} placeholder={transaction.amount}></input>
                    </div>
                </td>
                <td>
                    <select className="form-control" name="category" value={formState.category} onChange={handleChange} required>
                        {formState.type === 'income' && <IncomeCategories />}
                        {formState.type === 'expense' && <ExpenseCategories />}
                        <option value="other">Other</option>
                    </select>
                </td>
                <td>
                    <select className="form-control" name="repeat_interval" value={formState.repeat_interval} onChange={handleChange} required>
                        <option value="none">One time</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </td>
                <td>
                    <input type="text" readonly class="form-control-plaintext" value={formatTimestamp(transaction.date)}></input>
                </td>
            </tr>
        );
    }

    return (
        <tr data-id={transaction.id} data-userid={transaction.userID}>
            <th scope="row">
                <button type="button" className="btn btn-primary btn-sm" onClick={toggleEditMode}>Edit</button>
            </th>
            <td>{capitalizeFirstLetter(transaction.methodName)}</td>
            <td>{capitalizeFirstLetter(transaction.type)}</td>
            <td>${transaction.amount}</td>
            <td>{capitalizeFirstLetter(transaction.category)}</td>
            <td>{capitalizeFirstLetter(transaction.repeat_interval)}</td>
            <td>{formatTimestamp(transaction.date)}</td>
        </tr>
    );
}

// Main Details Component
function Details({ onTransactionEdited, methods }) {
    const [monthList, setMonthList] = React.useState([]);
    const [selectedMonth, setSelectedMonth] = React.useState('');
    const [transactions, setTransactions] = React.useState([]);

    React.useEffect(() => {
        fetch('/list_months')
            .then(response => response.json())
            .then(monthList => setMonthList(monthList));
    }, []);

    React.useEffect(() => {
        if (selectedMonth) {
            const [month, year] = selectedMonth.split(' ');
            const monthIndex = new Date(Date.parse(month + " 1, 2012")).getMonth() + 1;
            fetch(`/list_month_transactions/${monthIndex}/${year}`)
                .then(response => response.json())
                .then(transactions => setTransactions(transactions));
        } else {
            fetch('/list_all_transactions')
                .then(response => response.json())
                .then(transactions => setTransactions(transactions));
        }
    }, [selectedMonth]);

    function handleMonthChange(e) {
        setSelectedMonth(e.target.value);
    }

    return (
        <div id="details">
            <Spacer size="4" />
            <form>
                <h1>Select Filters</h1>
                <Spacer size="3"/>
                <label>Time</label>
                <select className="form-control" name="month-filter" onChange={handleMonthChange}>
                    <option value="">All time</option>
                    {monthList.map((month, index) => (
                        <option key={index} value={`${month.month} ${month.year}`}> {month.month} {month.year} </option>
                    ))}
                </select>
            </form>
            <Spacer size="4" />
            <div>
                <h2>Recent transactions</h2>
                <Spacer size="3" />
                <div className="table-responsive">
                    <table className="table">
                        <thead className="thead-light">
                            <tr>
                                <th scope="col"></th>
                                <th scope="col">Method</th>
                                <th scope="col">Type</th>
                                <th scope="col">Amount</th>
                                <th scope="col">Category</th>
                                <th scope="col">Repetition</th>
                                <th scope="col">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(transaction => (
                                <TransactionTableRow
                                    key={transaction.id}
                                    transaction={transaction}
                                    onTransactionEdited={onTransactionEdited}
                                    methods={methods}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                <Spacer size="5" />
            </div>
        </div>
    );
}

/////////////// TRANSACTION FORM /////////////////
const IncomeCategories = () => {
    return (
           <>
           <option value="earned">Earned income</option>
           <option value="passive">Passive income</option>
           <option value="porftolio">Porftolio income</option>
           </>
       )
}

const ExpenseCategories = () => {
   return (
          <>
          <option value="entertainment">Entertainment</option>
          <option value="vehicle">Vehicle</option>
          <option value="housing">Housing</option>
          <option value="transportation">Transportation</option>
          <option value="shopping">Shopping</option>
          <option value="financial">Financial Expenses</option>
          <option value="food">Food and Drinks</option>
          </>
      )
}

// TransactionForm Component
function TransactionForm ({ onTransactionAdded, methods }) {
    const [checked, setChecked] = React.useState(false);

    const [state, setState] = React.useState({
        type: '',
        category: '',
        paymentMethod: '',
        amount: '',
        repetition: 'none'
    });

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    function handleCheck() {
        setChecked(!checked);
    }

    function createTransaction(e) {
        e.preventDefault();

        if (state.type != '' && state.category != '' 
            && state.paymentMethod != '' && state.amount != '' 
            && state.repetition != ''
        ) {
            fetch('/register_transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify(state)
            })
                .then(response => {
                    if (!response.ok) { throw new Error('Network response was not ok'); }
                    return response.json();
                })
                .then(method => {
                    setState({
                        type: '',
                        category: '',
                        paymentMethod: '',
                        amount: '',
                        repetition: 'none'
                    });
                    setChecked(false);
                    onTransactionAdded();
                })
                .catch(error => {
                    console.error('Fetch operation failed', error);
                })

        } else {
            console.log('Form must have content');
        }

        return false;
    }
   
    return (
    <div id="transaction-form">
        <Spacer size="4" />
        <h1>Add transaction</h1>
        <Spacer size="4" />
        <form>
            <select className="form-control" name="type" value={state.type} onChange={handleChange} required>
                <option value="" disabled>Transaction Type</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
            </select>
            <Spacer size="4" />
            <select className="form-control" name="category" value={state.category} onChange={handleChange} required>
                <option value="" disabled>Category</option>
                { state.type === 'income' && <IncomeCategories />}
                { state.type === 'expense' && <ExpenseCategories />}
                <option value="other">Other</option>
            </select>
            <Spacer size="4" />
            <select className="form-control" name="paymentMethod" value={state.paymentMethod} onChange={handleChange} required>
                <option value="" disabled>Payment method</option>
                { methods.map((method) => (
                     <option key={method.id} value={method.id}> {method.name} </option>
                    ))
                }
            </select>
            <Spacer size="4" />
            <div className="mb-3">
                <label htmlFor="form-amount" className="form-label">Amount</label>
                <input type="number" className="form-control" id="form-amount"
                       placeholder="0.00" min="0.01" name="amount" value={state.amount} onChange={handleChange}/>
            </div>
            <Spacer size="2" />
            <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" value={checked} onChange={handleCheck}/>
                <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Repeating</label>
            </div>
            <Spacer size="4" />

            {checked ? 
            <>
                <select className="form-control" name="repetition" value={state.repetition} onChange={handleChange}>
                    <option value="none">One time</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
                <Spacer size="4" />
            </> : null}

            <button type="submit" onClick={event => createTransaction(event)} className="btn btn-primary">Add transaction</button>
            <Spacer size="4" />
        </form>
    </div>
    );
}

//////////// PAYMENT OPTION FORM ///////////////////

const MethodForm = ({ onMethodAdded }) => {
    const [state, setState] = React.useState({
        methodName: '',
        methodType: '',
        methodProcessor: ''
    });

    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    function createMethod(e) {
        e.preventDefault();

        if (state.methodName != '' && state.methodType != '' && state.methodProcessor != '' ) {
            fetch('/method', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify(state)
            })
                .then(response => {
                    if (!response.ok) { throw new Error('Network response was not ok'); }
                    return response.json();
                })
                .then(method => {
                    console.log(method);
                    setState({
                        methodName: '',
                        methodType: '',
                        methodProcessor: ''
                    });
                    onMethodAdded();
                })
                .catch(error => {
                    console.error('Fetch operation failed', error);
                })

        } else {
            console.log('Form must have content');
        }

        return false;
    }

    return (
        <div id="method-form">
            <Spacer size="4" />
            <h1>Add Payment Method</h1>
            <Spacer size="4" />
            <form>
            <div className="input-group mb-3">
                <input
                type="text"
                className="form-control"
                placeholder="Card Name"
                aria-label="Card-Name"
                name="methodName"
                value={state.methodName}
                onChange={handleChange}
                required
                />
            </div>
            <select className="form-control" aria-label="Category Select" name="methodType" value={state.methodType}
                onChange={handleChange}>
                <option value="" disabled>Type</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
            </select>
            <Spacer size="2" />
            <select className="form-control" aria-label="Category Select" name="methodProcessor" value={state.methodProcessor}
                onChange={handleChange}>
                <option value="" disabled>Card Processor</option>
                <option value="mastercard">Mastercard</option>
                <option value="visa">Visa</option>
                <option value="discovery">Discovery</option>
                <option value="am">American Express</option>
            </select>
            <Spacer size="4" />
            <button type="submit" onClick={event => createMethod(event)} className="btn btn-primary">Add Method</button>
            <Spacer size="4" />
            </form>
        </div>
    );
}
