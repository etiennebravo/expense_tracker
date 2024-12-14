const body = document.querySelector('#body');
const bodyRoot = ReactDOM.createRoot(body);
bodyRoot.render(<App />);

function App() {
    return (
        <div className="app">
            <Summary />
            <Details />
            <TransactionForm />
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
function Summary() {
    const [transactions, setTransactions] = React.useState([])

    React.useEffect(() => {
        fetch('/list_transactions')
        .then (response => {
            console.log(response)
            return response.json();
        })
        .then (data => {
            console.log(data);
            setTransactions(data);
        })
    }, []);

    return (
        <div id="summary">
            <Spacer size="3" />
            <h2>Summary</h2>
            <Spacer size="4" />


            <>
                <SummaryRow>
                    <SummaryColumn flexClass="flex4">
                        <SummaryInfo title="Total monthly expenses" amount={transactions.expense_amount} description="+16% Tax" />
                    </SummaryColumn>
                    <SummaryColumn flexClass="flex6">
                        <SummaryInfo title="Monthly Income" amount={transactions.income_amount} description="+8% From returns" />
                    </SummaryColumn>
                </SummaryRow>
                <Spacer size="4" />

                <SummaryRow>
                    <SummaryColumn flexClass="flex1">
                        <SummaryInfo title="Total variable expenses" amount={transactions.variable_expense_amount} description="+16% Tax" />
                    </SummaryColumn>
                    <SummaryColumn flexClass="flex1">
                        <SummaryInfo title="Total fixed expenses" amount={transactions.fixed_expense_amount} description="Expected payments" />
                    </SummaryColumn>
                    <SummaryColumn flexClass="flex1">
                        <SummaryInfo title="Balance" amount={transactions.balance} description="* The more the better" />
                    </SummaryColumn>
                </SummaryRow>
                <Spacer size="4" />
            </>
            
        </div>
    );
}

///////////// DETAILS /////////////////

// Month Selector Component
const MonthSelector = () => (
    <div>
        <h2>Month</h2>
        <select className="form-select" defaultValue={'December 2024'}>
            <option value="1">December 2024</option>
            <option value="2">November 2024</option>
            <option value="3">September 2024</option>
        </select>
    </div>
);

// Transaction Table Component
const TransactionTable = () => (
    <div>
        <h2>Recent transactions</h2>
        <table className="table">
            <thead className="thead-light">
                <tr>
                    <th scope="col"></th>
                    <th scope="col">Card</th>
                    <th scope="col">Type</th>
                    <th scope="col">Category</th>
                    <th scope="col">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">1</th>
                    <td>American Express</td>
                    <td>Expense</td>
                    <td>Groceries</td>
                    <td>$150</td>
                </tr>
                <tr>
                    <th scope="row">2</th>
                    <td>Discovery</td>
                    <td>Expense</td>
                    <td>Entertainment</td>
                    <td>$100</td>
                </tr>
                <tr>
                    <th scope="row">3</th>
                    <td>Cash</td>
                    <td>Expense</td>
                    <td>Gas</td>
                    <td>$20</td>
                </tr>
            </tbody>
        </table>
        <button type="button" className="btn btn-primary">Add transaction</button>
    </div>
);

// Main Details Component
const Details = () => (
    <div id="details">
        <Spacer size="4" />
        <MonthSelector />
        <Spacer size="4" />
        <TransactionTable />
    </div>
);

/////////////// TRANSACTION FORM /////////////////

// TransactionForm Component
function TransactionForm () {
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
                    console.log(method);
                    setState({
                        type: '',
                        category: '',
                        paymentMethod: '',
                        amount: '',
                        repetition: 'none'
                    });
                    setChecked(false);
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
        .then (response => {
            console.log(response)
            return response.json();
        })
        .then (methods => {
            console.log(methods);
            setMethods(methods)
        })
    }, []);

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
                <option value="groceries">Groceries</option>
                <option value="entertainment">Entertainment</option>
                <option value="gas">Gas</option>
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
