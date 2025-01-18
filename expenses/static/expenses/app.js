const body = document.querySelector('#body');
const bodyRoot = ReactDOM.createRoot(body);
bodyRoot.render(<App />);

function App() {
    const [transactions, setTransactions] = React.useState([]);
    const [summaryInfo, setSummaryInfo] = React.useState([]);
    const [methods, setMethods] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchTransactions();
        fetchSummary();
        fetchMethods();
    }, []);


    function fetchTransactions() {
        fetch('/list_all_transactions')
            .then(response => response.json())
            .then(transactions => {
                setTransactions(transactions);
                setLoading(false);
            });
    }

    function fetchSummary() {
        fetch('/summary')
            .then(response => response.json())
            .then(data => setSummaryInfo(data));
    }

    function updateTransactions() {
        fetchTransactions();
        fetchSummary();
    }

    function fetchMethods() {
        fetch('/list_methods')
            .then(response => response.json())
            .then(data => setMethods(data));
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="app">
            <Summary summary={summaryInfo} />
            <Details transactions={transactions} onTransactionEdited={updateTransactions} methods={methods} />
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

/////////////// Utilities ///////////////////

const Spacer = ({ size }) => <div className={`spacer${size}`}></div>;

const Message = ({ color, message }) => 
    <div>
        <div className={`alert alert-${color}`} role="alert">{ message }</div>
        <Spacer size="2" />
    </div>;

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
const SummaryColumn = ({ children }) => (
    <div className={`summary-column summary-item`}>
        {children}
    </div>
);

// Summary row component
const SummaryRow = ({ children }) => (
    <>
        <div className="summary-row">
            {children}
        </div>
        <Spacer size="4" />
    </>
);

// Main summary component
function Summary({ summary }) {
    return (
        <div id="summary">
            <Spacer size="3" />
            <h2>Current month summary</h2>
            <Spacer size="4" />


            <>
                <SummaryRow>
                    <SummaryColumn>
                        <SummaryBalance title="Balance" amount={summary.balance} description="* The more the better" />
                    </SummaryColumn>
                    <SummaryColumn>
                        <SummaryInfo title="Total monthly expenses" amount={summary.expense_amount} description="" />
                    </SummaryColumn>
                    <SummaryColumn>
                        <SummaryInfo title="Monthly Income" amount={summary.income_amount} description="" />
                    </SummaryColumn>
                </SummaryRow>
                

                <SummaryRow>
                    <SummaryColumn>
                        <SummaryInfo title="Total variable expenses" amount={summary.variable_expense_amount} description="One time payments" />
                    </SummaryColumn>
                    <SummaryColumn>
                        <SummaryInfo title="Total fixed expenses" amount={summary.fixed_expense_amount} description="Recurring payments" />
                    </SummaryColumn>
                </SummaryRow>

                {summary.payment_method_balances ? 
                    <div>
                        <h3>Lifetime method balances</h3>
                        <SummaryRow>
                            {summary.payment_method_balances && Object.entries(summary.payment_method_balances).map(([method, balance]) => (
                                <SummaryColumn key={method}>
                                    <SummaryBalance title={method} amount={balance} description="Balance" />
                                </SummaryColumn>
                            ))}
                        </SummaryRow>
                </div>
                : null }
            </>
            
        </div>
    );
}

///////////// DETAILS /////////////////
const EmptyTransaction = () => {
    return (
        <tr>
            <th scope="row"></th>
            <td>No transactions found</td>
        </tr>
    );
}

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
                    </select>
                </td>
                <td>
                    <input type="text" readOnly className="form-control-plaintext" value={formatTimestamp(transaction.date)}></input>
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
function Details({ transactions, onTransactionEdited, methods }) {
    const [monthList, setMonthList] = React.useState([]);
    const [filteredTransactions, setFilteredTransactions] = React.useState(transactions);
    const [filter, setFilter] = React.useState({
        month: '',
        type: '',
        method: ''
    });
    const [currentPage, setCurrentPage] = React.useState(1);
    const PageSize = 10;

    React.useEffect(() => {
        fetch('/list_months')
            .then(response => response.json())
            .then(monthList => setMonthList(monthList));
    }, []);

    React.useEffect(() => {
        setFilteredTransactions(transactions);
    }, [transactions]);

    React.useEffect(() => {
        filterTransactions();
    }, [filter]);

    function handleFilterChange(e) {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value
        });
    }

    function filterTransactions() {
        let filtered = transactions;

        if (filter.month) {
            const [month, year] = filter.month.split(' ');
            const monthIndex = new Date(Date.parse(month + " 1, 2000")).getMonth() + 1;
            filtered = filtered.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return transactionDate.getMonth() + 1 === monthIndex && transactionDate.getFullYear() === parseInt(year);
            });
        }

        if (filter.type) {
            filtered = filtered.filter(transaction => transaction.type === filter.type);
        }

        if (filter.method) {
            filtered = filtered.filter(transaction => transaction.methodID === parseInt(filter.method));
        }

        setFilteredTransactions(filtered);
    }

    const currentListData = React.useMemo(() => {
        const firstPageIndex = (currentPage - 1) * PageSize;
        const lastPageIndex = firstPageIndex + PageSize;
        return filteredTransactions.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, filteredTransactions]);

    return (
        <div id="details">
            <Spacer size="4" />
            <form>
                <h2>Details</h2>
                <Spacer size="3"/>
                    <div className="filters">
                        <div className="flex1">
                            <label>Time</label>
                            <select className="form-control" name="month" value={filter.month} onChange={handleFilterChange}>
                                <option value="">All time</option>
                                {monthList.map((month, index) => (
                                    <option key={index} value={`${month.month} ${month.year}`}> {month.month} {month.year} </option>
                                ))}
                            </select>
                        </div>
                    <Spacer size="3"/>
                    <div className="flex1">
                        <label>Type</label>
                        <select className="form-control" name="type" value={filter.type} onChange={handleFilterChange}>
                            <option value="">All types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                </div>
                <Spacer size="3"/>
                <label>Payment Method</label>
                <select className="form-control" name="method" value={filter.method} onChange={handleFilterChange}>
                    <option value="">All methods</option>
                    {methods.map((method) => (
                        <option key={method.id} value={method.id}> {method.name} </option>
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
                        {currentListData.length === 0 && <EmptyTransaction/>}
                        {currentListData.map(transaction => (
                            <TransactionTableRow
                                key={transaction.id}
                                transaction={transaction}
                                onTransactionEdited={onTransactionEdited}
                                methods={methods}
                            />
                        ))}
                        </tbody>
                    </table>
                    <hr/>
                </div>
                {filteredTransactions.length > PageSize ? <Pagination
                    className="pagination-bar"
                    currentPage={currentPage}
                    totalCount={filteredTransactions.length}
                    pageSize={PageSize}
                    onPageChange={page => setCurrentPage(page)}
                /> : null}
                <Spacer size="5" />
            </div>
        </div>
    );
}

const Pagination = ({ className, currentPage, totalCount, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(totalCount / pageSize);

    const handleClick = (page) => {
        if (onPageChange) { 
            onPageChange(page); 
        }
    };

    return (
        <ul className={`pagination ${className} flex-row space-evenly`}>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`} onClick={() => handleClick(currentPage - 1)} > 
                <strong className="clickable">Previous</strong>
            </li>
            <big>{currentPage}</big>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`} onClick={() => handleClick(currentPage + 1)} >
                <strong className="clickable">Next</strong>
            </li>
        </ul>
    );
};

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
    const [alert, setAlert] = React.useState({ success: false, error: false, warning: false});
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
                    setAlert({ success: true, error: false, warning: false });
                    onTransactionAdded();
                })
                .catch(error => {
                    console.error('Fetch operation failed', error);
                    setAlert({ success: false, error: true, warning: false });
                })

        } else {
            console.log('Form must have content');
            setAlert({ success: false, error: false, warning: true });
        }

        return false;
    }
   
    return (
    <div id="transaction-form">
        <Spacer size="4" />
        <h1>Add transaction</h1>
        <Spacer size="4" />
        {alert.error && <Message color="error" message="Error submitting form"/>}
        {alert.warning && <Message color="warning" message="Must fill form"/>}
        {alert.success && <Message color="success" message="Transaction recorded"/>}
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
