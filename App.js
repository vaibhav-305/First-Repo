var useState = React.useState;
var useEffect = React.useEffect;

function LoginSignup({ setLogin }) {
    const [onRegs, setOnRegs] = useState(false);
    const [err, setErr] = useState('')
    const [user, setUser] = useState({ name: '', email: '', pass: '' });
    const [load, setLoad] = useState('none');

    const inputEvent = e => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value })
        setErr('')
    }
    const RegisterSubmit = (event) => {
        event.preventDefault();
        setLoad('inline-block');
        chrome.runtime.sendMessage({ action: "register", data: JSON.stringify(user) },
            function (response) {
                //console.log(response);
                setOnRegs(!response.verdict);
                setLoad('none');
                setErr(response.msg);
            }
        );
        //setOnRegs(false);
    }
    const loginSubmit = (event) => {
        event.preventDefault();
        setLoad('inline-block');
        chrome.runtime.sendMessage({ action: "login", data: JSON.stringify(user) },
            function (response) {
                //console.log(response);
                setLogin(response.verdict);
                setLoad('none');
                setErr(response.msg);
            }
        );
        //setLogin(true);
    }

    return (
        <div class="loginsignup">
            {
                onRegs
                    ? <div>
                        <h1 class="h3 mb-3 fw-normal text-center">Please Register</h1>
                        <form class="form-signinup" onSubmit={RegisterSubmit}>
                            <div class="form-floating">
                                <input type="text" class="form-control" placeholder="Username" name="name" onChange={inputEvent} value={user.name} required />
                                <label for="floatingInput">Username</label>
                            </div>
                            <div class="form-floating">
                                <input type="email" class="form-control " placeholder="Email" name="email" onChange={inputEvent} value={user.email} required />
                                <label for="floatingInput">Email</label>
                            </div>
                            <div class="form-floating">
                                <input type="password" class="form-control " placeholder="Password" name="pass" onChange={inputEvent} value={user.pass} required />
                                <label for="floatingPassword">Password</label>
                            </div>
                            <h3>{err}</h3>
                            <button class="w-70 btn btn-lg btn-primary mt-2 mb-3" type="submit">
                                Sign Up <span style={{ display: `${load}` }} class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            </button>
                        </form>
                        <div>
                            <p class="mb-0">Already have an account? <span class="navlink text-black-50 fw-bold" onClick={() => setOnRegs(false)}>Sign in</span></p>
                        </div>
                    </div>
                    : <div>
                        <h1 class="h3 mb-3 fw-normal text-center">Please sign in</h1>
                        <form class="form-signinup" onSubmit={loginSubmit}>
                            <div class="form-floating">
                                <input type="email" class="form-control" placeholder="Email" name="email" onChange={inputEvent} value={user.email} required />
                                <label for="floatingInput">Email</label>
                            </div>
                            <div class="form-floating">
                                <input type="password" class="form-control" placeholder="Password" name="pass" onChange={inputEvent} value={user.pass} required />
                                <label for="floatingPassword">Password</label>
                            </div>
                            <h3>{err}</h3>
                            <button class="w-70 btn btn-lg btn-primary mt-2 mb-3" type="submit">
                                Sign in <span style={{ display: `${load}` }} class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            </button>
                        </form>
                        <div>
                            <p class="mb-0">Don't have an account? <span class="navlink text-black-50 fw-bold" onClick={() => setOnRegs(true)}>Sign Up</span></p>
                        </div>
                    </div>
            }
        </div>
    )
}

function Notes({ setLogin, vid }) {

    const [notec, setNotec] = useState({
        hh: 0,
        mm: 0,
        ss: 0,
        noteac: ''
    });
    const [err, setErr] = useState("");
    const [load, setLoad] = useState('none');
    const [getLoader,setGetLoader] = useState('block');
    const [allNotes, setAllNotes] = useState([]);
    const [cc, setcc] = useState(vid)
    const getVideoID = () => {
        let rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
        r = document.URL.match(rx);
        return r[1];
    }

    //console.log('In Notes: ',vid,cc);
    if (vid !== cc)
        setcc(vid)

    useEffect(() => {
        //console.log('pgChanged')
        setErr('');
        setGetLoader('block');
        chrome.runtime.sendMessage({ action: "get", vidID: cc },
            function (response) {
                if (response.verdict){
                    setAllNotes(JSON.parse(response.msg))
                    setGetLoader('none');
                }
                else{
                    alert('Some error occured, refresh page!')
                    setErr('Some error occured, refresh page');
                }
            }
        );
        setAllNotes([]);
    }, [cc]);

    function secondsToHms(d) {
        let h = Math.floor(d / 3600);
        let m = Math.floor(d % 3600 / 60);
        let s = Math.floor(d % 3600 % 60);

        return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
    }
    const goToTime = (timest) => {
        //console.log("timest: ", timest);
        document.getElementsByTagName('video')[0].currentTime = timest
    }

    const inputEvent = e => {
        const { name, value } = e.target;
        if (name !== 'noteac')
            setNotec({ ...notec, [name]: toInt(value) })
        else
            setNotec({ ...notec, [name]: value })
    }

    const logout = () => {
        chrome.runtime.sendMessage({ action: "logout" },
            function (response) {
                //console.log(response.verdict);
                setLogin(!response.verdict);
                //badaThis.setState({ isLogin: response.verdict });
            }
        );
    }
    const toInt = (a) => {
        if (typeof (a) === 'number')
            return a;
        else
            return parseInt(a);
    }
    const noteSubmit = (event) => {
        event.preventDefault();

        //setAllNotes(allNotes.concat(<Note content={notec.noteac} hh={toInt(notec.hh)} mm={toInt(notec.mm)} ss={toInt(notec.ss)} />));
        let timest = notec.hh * 3600 + notec.mm * 60 + notec.ss;
        if(allNotes.find(o => o.timestamp === timest)!==undefined){
            setErr('Timestamp already exists!')
            return;
        }
        setLoad('inline-block');
        chrome.runtime.sendMessage({ action: "add", vidID: getVideoID(), timestamp: timest, noteContent: notec.noteac },
            function (response) {
                //console.log(response.verdict);
                if (response.verdict === true) {
                    setAllNotes(allNotes.concat({ timestamp: timest, noteContent: notec.noteac }));
                    setNotec({ hh: 0, mm: 0, ss: 0, noteac: '' })
                    setErr("");
                }
                else {
                    setErr('Some error occured , try again.');
                }
                setLoad('none');
            }
        );
    }
    const deleteData = (timest) => {
        //console.log('Del: ', timest);
        setErr('Deleting...')
        chrome.runtime.sendMessage({ action: "delete", vidID: getVideoID(), timestamp: timest },
            function (response) {
                if (response.verdict === true) {
                    const newNotes = allNotes.filter((notte) => notte.timestamp !== timest);
                    setAllNotes(newNotes);
                    setErr('');
                }
                else
                    setErr('Some error occured while deleting , try again.');
            }
        )
    }


    return (
        <div id="notes" class="notes">
            <p className='d-flex justify-content-between'><a class="btn btn-outline-success" href='https://youmark-backend.herokuapp.com' target="_blank" rel="noopener noreferrer">See all bookmarks</a><button class="btn btn-outline-danger" onClick={logout}>Log Out</button></p>
            <br/>
            <form onSubmit={noteSubmit}>
                Time: <input type='number' name='hh' onChange={inputEvent} value={notec.hh} style={{ width: "35px" }} required min="0" oninput="validity.valid||(value='');" /><b> : </b><input type='number' name='mm' onChange={inputEvent} value={notec.mm} style={{ width: "35px" }} required min="0" oninput="validity.valid||(value='');"/><b> : </b><input type='number' name='ss' onChange={inputEvent} value={notec.ss} style={{ width: "35px" }} required min="0" oninput="validity.valid||(value='');"/><br />
                <div class="form-group">
                    <label for="note">Note: </label>
                    <textarea class="form-control" name='noteac' onChange={inputEvent} value={notec.noteac} id="note" rows="3"></textarea>
                </div>
                <button class="btn btn-primary my-1" type="submit">
                    Submit <span style={{ display: `${load}` }} class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                </button>
                <div>{err}</div>
            </form>
            <br />
            <div className="d-flex justify-content-center">
                <div className="spinner-border" style={{height:'3rem', width:'3rem', display: `${getLoader}`}} role="status"></div>
            </div>
            <div className="accordion">
                {allNotes.map(Note => (
                    <div class="accordion-item">
                        <div class='accorbtn collapsed' type="button" data-bs-toggle="collapse" data-bs-target={`#n${Note.timestamp}`} aria-expanded="false" aria-controls="panelsStayOpen">
                            <span class="d-flex justify-content-between align-items-center p-1">
                                {Note.noteContent.slice(0, 30)}...
                                <span class="p-1">
                                    <button class="time-link" onClick={() => goToTime(Note.timestamp)}>{secondsToHms(Note.timestamp)}</button>
                                </span>
                            </span>
                        </div>
                        <div id={`n${Note.timestamp}`} class="accordion-collapse collapse" aria-labelledby="panelsStayOpen">
                            <div class="accordion-body">
                                <p>
                                    {Note.noteContent}
                                </p>
                                <button class='btn-danger goRight' onClick={() => deleteData(Note.timestamp)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function App() {
    const [isLogin, setLogin] = useState(false);
    const [disp,setDisp] = useState({
        loadDisplay:'block',
        divVis:'hidden'
    })

    useEffect(() => {
        chrome.runtime.sendMessage({ action: "verify" },
            function (response) {
                //console.log(response.verdict);
                setLogin(response.verdict);
                setDisp({loadDisplay:'none',divVis:'visible'});
            }
        );
    }, [])
    const getVideoID = () => {
        let rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
        r = document.URL.match(rx);
        return r[1];
    }
    //console.log('This is apperrrr: ');
    return (
        <div>
            {/*Hello from App.js {document.getElementsByTagName('title')[0].innerHTML}*/}
            <div style={{display: `${disp.loadDisplay}`}} id='loader'></div>
            <div style={{ visibility: `${disp.divVis}` }}>
            {
                isLogin
                    ? <Notes setLogin={setLogin} vid={getVideoID()} />
                    : <LoginSignup setLogin={setLogin} />
            }
            </div>

        </div>
    );

}
//num +ve: https://stackoverflow.com/questions/19233415/how-to-make-type-number-to-positive-numbers-only
//Run jsx pre processor: npx babel --watch src --out-dir . --presets react-app/prod