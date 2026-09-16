import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs
} from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// =====================================================
// FIREBASE
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyBbAHLR73Zz_xZB9EbMfHonKDh1Z-Yp5jc",

    authDomain:
        "baby-1a093.firebaseapp.com",

    projectId:
        "baby-1a093",

    storageBucket:
        "baby-1a093.firebasestorage.app",

    messagingSenderId:
        "532874379294",

    appId:
        "1:532874379294:web:0fcdfc328baf72a3862e0f",

    measurementId:
        "G-LGKHXL6LK6"
};


const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


// =====================================================
// ADMIN UID
// =====================================================

const ADMIN_UID =
    "s16n0EkUn3TzR7Vs6dVhFGX4pH32";


// =====================================================
// ELEMENTOS
// =====================================================

const loginScreen =
    document.getElementById("loginScreen");

const adminScreen =
    document.getElementById("adminScreen");

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginButtonText =
    document.getElementById("loginButtonText");

const loginSpinner =
    document.getElementById("loginSpinner");

const loginError =
    document.getElementById("loginError");

const togglePassword =
    document.getElementById("togglePassword");

const logoutButton =
    document.getElementById("logoutButton");

const totalVotesElement =
    document.getElementById("totalVotes");

const resultsList =
    document.getElementById("resultsList");


// =====================================================
// NOMES
// =====================================================

const maleNames = [
    "Ezequiel",
    "Elias",
    "Eliel",
    "Azaf"
];

const femaleNames = [
    "Maya",
    "Malu",
    "Mavie",
    "Laura"
];

const names = [
    ...maleNames,
    ...femaleNames
];


// =====================================================
// CONTADORES
// =====================================================

const voteCounts = {

    Ezequiel: 0,
    Elias: 0,
    Eliel: 0,
    Azaf: 0,

    Maya: 0,
    Malu: 0,
    Mavie: 0,
    Laura: 0
};


// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearLoginError();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            showLoginError(
                "Preencha o e-mail e a senha."
            );

            return;
        }


        setLoginLoading(true);


        try {

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            console.log(
                "Usuário autenticado:",
                user.uid
            );


            if (user.uid !== ADMIN_UID) {

                await signOut(auth);

                showLoginError(
                    "Esta conta não possui acesso administrativo."
                );

                return;
            }


            showAdminPanel();


        } catch (error) {

            console.error(
                "Erro de login:",
                error
            );


            showLoginError(
                getLoginErrorMessage(error)
            );

        } finally {

            setLoginLoading(false);
        }
    }
);


// =====================================================
// MOSTRAR / ESCONDER SENHA
// =====================================================

togglePassword.addEventListener(
    "click",
    () => {

        const isPassword =
            passwordInput.type === "password";


        passwordInput.type =
            isPassword
                ? "text"
                : "password";


        togglePassword.textContent =
            isPassword
                ? "🙈"
                : "👁";
    }
);


// =====================================================
// LOGOUT
// =====================================================

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            showLoginPanel();

            loginForm.reset();

        } catch (error) {

            console.error(
                "Erro ao sair:",
                error
            );
        }
    }
);


// =====================================================
// ESTADO DA AUTENTICAÇÃO
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            showLoginPanel();

            return;
        }


        console.log(
            "Estado atual:",
            user.uid
        );


        if (user.uid !== ADMIN_UID) {

            await signOut(auth);

            showLoginPanel();

            showLoginError(
                "Acesso administrativo não autorizado."
            );

            return;
        }


        showAdminPanel();
    }
);


// =====================================================
// MOSTRAR PAINEL
// =====================================================

function showAdminPanel() {

    loginScreen.classList.add(
        "hidden"
    );

    adminScreen.classList.remove(
        "hidden"
    );


    loadVotes();
}


// =====================================================
// MOSTRAR LOGIN
// =====================================================

function showLoginPanel() {

    adminScreen.classList.add(
        "hidden"
    );

    loginScreen.classList.remove(
        "hidden"
    );
}


// =====================================================
// CARREGAR VOTOS
// =====================================================

async function loadVotes() {

    try {

        showLoading();


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "votes"
                )
            );


        // ZERA OS CONTADORES

        names.forEach(
            (name) => {

                voteCounts[name] = 0;
            }
        );


        // =================================================
        // LÊ CADA PARTICIPANTE
        // =================================================

        snapshot.forEach(
            (documentSnapshot) => {

                const vote =
                    documentSnapshot.data();


                console.log(
                    "Voto encontrado:",
                    vote
                );


                // VOTO MASCULINO

                if (
                    typeof vote.nomeMasculino === "string"
                    &&
                    maleNames.includes(
                        vote.nomeMasculino
                    )
                ) {

                    voteCounts[
                        vote.nomeMasculino
                    ]++;
                }


                // VOTO FEMININO

                if (
                    typeof vote.nomeFeminino === "string"
                    &&
                    femaleNames.includes(
                        vote.nomeFeminino
                    )
                ) {

                    voteCounts[
                        vote.nomeFeminino
                    ]++;
                }
            }
        );


        // =================================================
        // TOTAL DE PARTICIPANTES
        // =================================================

        totalVotesElement.textContent =
            snapshot.size;


        console.log(
            "Total de participantes:",
            snapshot.size
        );


        console.log(
            "Resultados:",
            voteCounts
        );


        renderResults();


    } catch (error) {

        console.error(
            "Erro ao carregar votos:",
            error
        );


        showMessage(
            "Não foi possível carregar os resultados."
        );
    }
}


// =====================================================
// RENDERIZAR RESULTADOS
// =====================================================

function renderResults() {

    resultsList.innerHTML = "";


    // =================================================
    // MENINOS
    // =================================================

    const maleTitle =
        document.createElement("div");

    maleTitle.className =
        "gender-title male-title";

    maleTitle.innerHTML =
        `
            <span>⚽</span>
            MENINOS
        `;

    resultsList.appendChild(
        maleTitle
    );


    renderGenderResults(
        maleNames,
        resultsList
    );


    // =================================================
    // MENINAS
    // =================================================

    const femaleTitle =
        document.createElement("div");

    femaleTitle.className =
        "gender-title female-title";

    femaleTitle.innerHTML =
        `
            <span>🎀</span>
            MENINAS
        `;

    resultsList.appendChild(
        femaleTitle
    );


    renderGenderResults(
        femaleNames,
        resultsList
    );


    // =================================================
    // MINI CARDS
    // =================================================

    names.forEach(
        (name) => {

            const element =
                document.getElementById(
                    `count-${name}`
                );


            if (element) {

                element.textContent =
                    voteCounts[name];
            }
        }
    );
}


// =====================================================
// RESULTADOS POR GÊNERO
// =====================================================

function renderGenderResults(
    genderNames,
    container
) {

    const sortedResults =
        [...genderNames].sort(
            (a, b) =>
                voteCounts[b] -
                voteCounts[a]
        );


    const maxVotes =
        Math.max(
            ...sortedResults.map(
                (name) =>
                    voteCounts[name]
            ),
            1
        );


    sortedResults.forEach(
        (name, index) => {

            const votes =
                voteCounts[name];


            const position =
                index + 1;


            const percentage =
                (votes / maxVotes) * 100;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "result-item";


            item.innerHTML = `

                <div class="position">
                    ${getPositionIcon(position)}
                </div>

                <div>

                    <div class="result-name">
                        ${name}
                    </div>

                    <div class="result-bar-container">

                        <div
                            class="result-bar"
                            style="width: ${percentage}%"
                        ></div>

                    </div>

                </div>

                <div class="result-count">
                    ${votes}
                </div>

            `;


            container.appendChild(
                item
            );
        }
    );
}


// =====================================================
// POSIÇÃO
// =====================================================

function getPositionIcon(position) {

    if (position === 1) {
        return "🥇";
    }

    if (position === 2) {
        return "🥈";
    }

    if (position === 3) {
        return "🥉";
    }

    return position;
}


// =====================================================
// LOADING
// =====================================================

function showLoading() {

    resultsList.innerHTML = `

        <div class="loading">

            <div class="spinner"></div>

            <p>
                Carregando resultados...
            </p>

        </div>
    `;
}


// =====================================================
// MENSAGEM
// =====================================================

function showMessage(message) {

    resultsList.innerHTML = `

        <div class="loading">

            <p>
                ${message}
            </p>

        </div>
    `;
}


// =====================================================
// LOGIN LOADING
// =====================================================

function setLoginLoading(loading) {

    loginButton.disabled =
        loading;

    loginSpinner.classList.toggle(
        "hidden",
        !loading
    );

    loginButtonText.classList.toggle(
        "hidden",
        loading
    );
}


// =====================================================
// ERRO LOGIN
// =====================================================

function showLoginError(message) {

    loginError.textContent =
        message;
}


function clearLoginError() {

    loginError.textContent =
        "";
}


// =====================================================
// MENSAGENS FIREBASE
// =====================================================

function getLoginErrorMessage(error) {

    switch (error.code) {

        case "auth/invalid-credential":
            return "E-mail ou senha incorretos.";

        case "auth/invalid-email":
            return "Digite um e-mail válido.";

        case "auth/user-disabled":
            return "Esta conta foi desativada.";

        case "auth/too-many-requests":
            return "Muitas tentativas. Tente novamente mais tarde.";

        default:
            return "Não foi possível entrar. Verifique seus dados.";
    }
}
