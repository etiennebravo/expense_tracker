const body = document.querySelector('#body');
const bodyRoot = ReactDOM.createRoot(body);
bodyRoot.render(<App />);

function App() {
    const [summaryInfo, setSummaryInfo] = React.useState([]);
    const [transactions, setTransactions] = React.useState([]);

    React.useEffect(() => {
        fetchSummary();
        fetchTransactions();
    }, []);

    function fetchSummary() {
        fetch('/summary')
            .then(response => response.json())
            .then(data => setSummaryInfo(data));
    }

    function fetchTransactions() {
        fetch('/list_transactions')
            .then(response => response.json())
            .then(data => setTransactions(data));
    }

    return (
        <div className="app">
            <Summary summary={summaryInfo} />
            <Details transactions={transactions}/>
            <TransactionForm onTransactionAdded={fetchSummary} />
            <MethodForm />
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
                        <SummaryInfo title="Total monthly expenses" amount={summary.expense_amount} description="+16% Tax" />
                    </SummaryColumn>
                    <SummaryColumn flexClass="flex6">
                        <SummaryInfo title="Monthly Income" amount={summary.income_amount} description="+8% From returns" />
                    </SummaryColumn>
                </SummaryRow>
                <Spacer size="4" />

                <SummaryRow>
                    <SummaryColumn flexClass="flex1">
                        <SummaryInfo title="Total variable expenses" amount={summary.variable_expense_amount} description="+16% Tax" />
                    </SummaryColumn>
                    <SummaryColumn flexClass="flex1">
                        <SummaryInfo title="Total fixed expenses" amount={summary.fixed_expense_amount} description="Expected payments" />
                    </SummaryColumn>
                    <SummaryColumn flexClass="flex1">
                        <SummaryInfo title="Balance" amount={summary.balance} description="* The more the better" />
                    </SummaryColumn>
                </SummaryRow>
                <Spacer size="4" />
            </>
            
        </div>
    );
}

///////////// DETAILS /////////////////

const TransactionTableRow = ({transaction}) => {
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    function formatUnixTimestamp(timestamp) {
        var date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }   

    return (
        <tr>
            <th scope="row"></th>
            <td>{capitalizeFirstLetter(transaction.methodName)}</td>
            <td>{capitalizeFirstLetter(transaction.type)}</td>
            <td>{capitalizeFirstLetter(transaction.category)}</td>
            <td>${transaction.amount}</td>
            <td>{formatUnixTimestamp(transaction.date)}</td>
        </tr>
    );
}

// Main Details Component
const Details = ({transactions}) => (
    <div id="details">
        <Spacer size="4" />
        <div>
            <h2>Recent transactions</h2>
            <Spacer size="3" />
            <table className="table">
                <thead className="thead-light">
                    <tr>
                        <th scope="col"></th>
                        <th scope="col">Method</th>
                        <th scope="col">Type</th>
                        <th scope="col">Category</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => (
                        <TransactionTableRow key={index} transaction={transaction} />
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

/////////////// TRANSACTION FORM /////////////////

// TransactionForm Component
function TransactionForm ({ onTransactionAdded }) {
    const [checked, setChecked] = React.useState(false);
    const [methods, setMethods] = React.useState([]);

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
                    console.log(response);
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

    React.useEffect(() => {
        fetch('/list_methods')
        .then (response => response.json())
        .then (methods => setMethods(methods))
    }, []);

    function IncomeCategories() {
         return (
                <>
                <option value="earned">Earned income</option>
                <option value="passive">Passive income</option>
                <option value="porftolio">Porftolio income</option>
                </>
            )
    }

    function ExpenseCategories() {
        return (
               <>
               <option value="groceries">Groceries</option>
               <option value="entertainment">Entertainment</option>
               <option value="gas">Gas</option>
               <option value="housing">Housing</option>
               <option value="transportation">Transportation</option>
               </>
           )
   }

    return (
    <div id="transaction-form">
        <Spacer size="4" />
        <h1>Add transaction</h1>
        <Spacer size="4" />
        <form>
            <select className="form-select" name="type" value={state.type} onChange={handleChange} required>
                <option value="" disabled>Transaction Type</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
            </select>
            <Spacer size="4" />
            <select className="form-select" name="category" value={state.category} onChange={handleChange} required>
                <option value="" disabled>Category</option>
                { state.type === 'income' && <IncomeCategories />}
                { state.type === 'expense' && <ExpenseCategories />}
                <option value="other">Other</option>
            </select>
            <Spacer size="4" />
            <select className="form-select" name="paymentMethod" value={state.paymentMethod} onChange={handleChange} required>
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
                <select className="form-select" name="repetition" value={state.repetition} onChange={handleChange}>
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

// MethodForm Component
const MethodForm = () => {
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
                    console.log(response);
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
            <select className="form-select" aria-label="Category Select" name="methodType" value={state.methodType}
                onChange={handleChange}>
                <option value="" disabled>Type</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
            </select>
            <Spacer size="2" />
            <select className="form-select" aria-label="Category Select" name="methodProcessor" value={state.methodProcessor}
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
