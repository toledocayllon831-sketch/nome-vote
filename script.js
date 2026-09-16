/* =========================================================
   BABY VOTE
   SCRIPT.JS
   ========================================================= */


/* =========================
   FIREBASE IMPORTS
   ========================= */

   import { initializeApp } from
   "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
   getAuth,
   signInAnonymously,
   onAuthStateChanged
} from
   "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
   getFirestore,
   doc,
   getDoc,
   setDoc,
   serverTimestamp
} from
   "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================
  FIREBASE CONFIG
  ========================= */

const firebaseConfig = {
   apiKey: "AIzaSyBbAHLR73Zz_xZB9EbMfHonKDh1Z-Yp5jc",
   authDomain: "baby-1a093.firebaseapp.com",
   projectId: "baby-1a093",
   storageBucket: "baby-1a093.firebasestorage.app",
   messagingSenderId: "532874379294",
   appId: "1:532874379294:web:0fcdfc328baf72a3862e0f",
   measurementId: "G-LGKHXL6LK6"
};


/* =========================
  FIREBASE INITIALIZATION
  ========================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =========================
  OFFICIAL NAMES
  ========================= */

const validNames = {
   male: [
       "Ezequiel",
       "Elias",
       "Eliel",
       "Azaf"
   ],

   female: [
       "Maya",
       "Malu",
       "Mavie",
       "Laura"
   ]
};


/* =========================
  DOM ELEMENTS
  ========================= */

const nameButtons =
   document.querySelectorAll(".name-button");

const confirmationModal =
   document.getElementById("confirmationModal");

const modalIcon =
   document.getElementById("modalIcon");

const cancelButton =
   document.getElementById("cancelButton");

const confirmButton =
   document.getElementById("confirmButton");

const successOverlay =
   document.getElementById("successOverlay");

const animationLayer =
   document.getElementById("animationLayer");

const selectedMaleElement =
   document.getElementById("selectedMale");

const selectedFemaleElement =
   document.getElementById("selectedFemale");

const selectedMaleModal =
   document.getElementById("selectedMaleModal");

const selectedFemaleModal =
   document.getElementById("selectedFemaleModal");

const confirmedMale =
   document.getElementById("confirmedMale");

const confirmedFemale =
   document.getElementById("confirmedFemale");

const openConfirmationButton =
   document.getElementById("openConfirmationButton");


/* =========================
  APPLICATION STATE
  ========================= */

let currentUser = null;

let selectedMale = null;

let selectedFemale = null;

let alreadyVoted = false;

let isSavingVote = false;


/* =========================
  START APPLICATION
  ========================= */

initializeApplication();


async function initializeApplication() {

   try {

       console.log("Baby Vote iniciando...");

       await signInAnonymously(auth);

       console.log(
           "Autenticação anônima iniciada."
       );

   } catch (error) {

       console.error(
           "Erro ao iniciar autenticação:",
           error
       );

       showFirebaseError(
           "Não foi possível conectar ao sistema de votação."
       );
   }
}


/* =========================
  AUTH STATE
  ========================= */

onAuthStateChanged(auth, async (user) => {

   if (!user) {

       currentUser = null;

       console.error(
           "Nenhum usuário autenticado."
       );

       return;
   }

   currentUser = user;

   console.log(
       "Usuário autenticado:",
       currentUser.uid
   );

   await checkExistingVote();
});


/* =========================
  CHECK EXISTING VOTE
  ========================= */

async function checkExistingVote() {

   if (!currentUser) {
       return;
   }

   try {

       const voteReference = doc(
           db,
           "votes",
           currentUser.uid
       );

       const voteSnapshot =
           await getDoc(voteReference);


       if (voteSnapshot.exists()) {

           alreadyVoted = true;

           const voteData =
               voteSnapshot.data();

           console.log(
               "Este usuário já votou:",
               voteData
           );

           disableVotingInterface();

       } else {

           alreadyVoted = false;

           enableVotingInterface();
       }


   } catch (error) {

       console.error(
           "Erro ao verificar voto:",
           error
       );

       showFirebaseError(
           "Não foi possível verificar seu voto."
       );
   }
}


/* =========================
  NAME BUTTONS
  ========================= */

nameButtons.forEach((button) => {

   button.addEventListener("click", () => {

       if (alreadyVoted) {

           showFirebaseError(
               "Você já registrou seus votos."
           );

           return;
       }

       if (isSavingVote) {
           return;
       }


       const name =
           button.dataset.name;

       const gender =
           button.dataset.gender;


       if (!name || !gender) {

           console.error(
               "Botão sem nome ou gênero."
           );

           return;
       }


       if (!isValidName(name, gender)) {

           console.error(
               "Nome inválido:",
               name,
               gender
           );

           return;
       }


       /*
        * Se for masculino, salva a escolha masculina.
        */

       if (gender === "male") {

           selectedMale = name;

           selectedMaleElement.textContent =
               name;

       }


       /*
        * Se for feminino, salva a escolha feminina.
        */

       if (gender === "female") {

           selectedFemale = name;

           selectedFemaleElement.textContent =
               name;
       }


       /*
        * Marca visualmente o botão escolhido.
        */

       updateSelectedButtons();


       /*
        * Atualiza o botão final.
        */

       updateConfirmationButton();
   });
});


/* =========================
  VALIDATE NAME
  ========================= */

function isValidName(name, gender) {

   if (!validNames[gender]) {
       return false;
   }

   return validNames[gender].includes(name);
}


/* =========================
  UPDATE SELECTED BUTTONS
  ========================= */

function updateSelectedButtons() {

   nameButtons.forEach((button) => {

       const name =
           button.dataset.name;

       const gender =
           button.dataset.gender;


       button.classList.remove(
           "selected"
       );


       if (
           gender === "male" &&
           name === selectedMale
       ) {

           button.classList.add(
               "selected"
           );
       }


       if (
           gender === "female" &&
           name === selectedFemale
       ) {

           button.classList.add(
               "selected"
           );
       }
   });
}


/* =========================
  UPDATE CONFIRMATION BUTTON
  ========================= */

function updateConfirmationButton() {

   if (
       selectedMale &&
       selectedFemale
   ) {

       openConfirmationButton.disabled =
           false;

       openConfirmationButton.textContent =
           "Confirmar minhas escolhas";

   } else {

       openConfirmationButton.disabled =
           true;

       if (
           selectedMale &&
           !selectedFemale
       ) {

           openConfirmationButton.textContent =
               "Escolha um nome feminino";

       } else if (
           !selectedMale &&
           selectedFemale
       ) {

           openConfirmationButton.textContent =
               "Escolha um nome masculino";

       } else {

           openConfirmationButton.textContent =
               "Escolha os dois nomes";
       }
   }
}


/* =========================
  OPEN CONFIRMATION
  ========================= */

openConfirmationButton.addEventListener(
   "click",
   () => {

       if (alreadyVoted) {

           showFirebaseError(
               "Você já registrou seus votos."
           );

           return;
       }


       if (
           !selectedMale ||
           !selectedFemale
       ) {

           showFirebaseError(
               "Escolha um nome masculino e um nome feminino."
           );

           return;
       }


       openConfirmationModal();
   }
);


/* =========================
  OPEN CONFIRMATION MODAL
  ========================= */

function openConfirmationModal() {

   selectedMaleModal.textContent =
       selectedMale;

   selectedFemaleModal.textContent =
       selectedFemale;

   modalIcon.textContent =
       "👶";


   confirmationModal.classList.remove(
       "hidden"
   );

   confirmationModal.setAttribute(
       "aria-hidden",
       "false"
   );

   document.body.style.overflow =
       "hidden";
}


/* =========================
  CLOSE CONFIRMATION MODAL
  ========================= */

function closeConfirmationModal() {

   confirmationModal.classList.add(
       "hidden"
   );

   confirmationModal.setAttribute(
       "aria-hidden",
       "true"
   );

   document.body.style.overflow =
       "";
}


/* =========================
  CANCEL BUTTON
  ========================= */

cancelButton.addEventListener(
   "click",
   () => {

       if (isSavingVote) {
           return;
       }

       closeConfirmationModal();
   }
);


/* =========================
  BACKDROP CLICK
  ========================= */

confirmationModal
   .querySelector(".modal-backdrop")
   .addEventListener(
       "click",
       () => {

           if (isSavingVote) {
               return;
           }

           closeConfirmationModal();
       }
   );


/* =========================
  ESC KEY
  ========================= */

document.addEventListener(
   "keydown",
   (event) => {

       if (event.key !== "Escape") {
           return;
       }


       if (
           confirmationModal.classList.contains(
               "hidden"
           )
       ) {
           return;
       }


       if (isSavingVote) {
           return;
       }


       closeConfirmationModal();
   }
);


/* =========================
  CONFIRM VOTES
  ========================= */

confirmButton.addEventListener(
   "click",
   async () => {

       await submitVotes();
   }
);


/* =========================
  SUBMIT VOTES
  ========================= */

async function submitVotes() {

   if (isSavingVote) {
       return;
   }


   if (alreadyVoted) {

       showFirebaseError(
           "Você já registrou seus votos."
       );

       closeConfirmationModal();

       return;
   }


   if (!currentUser) {

       showFirebaseError(
           "Aguarde a conexão com o sistema."
       );

       return;
   }


   if (
       !selectedMale ||
       !selectedFemale
   ) {

       showFirebaseError(
           "Escolha um nome masculino e um nome feminino."
       );

       return;
   }


   if (
       !isValidName(
           selectedMale,
           "male"
       )
   ) {

       showFirebaseError(
           "Nome masculino inválido."
       );

       return;
   }


   if (
       !isValidName(
           selectedFemale,
           "female"
       )
   ) {

       showFirebaseError(
           "Nome feminino inválido."
       );

       return;
   }


   isSavingVote = true;

   setConfirmButtonLoading(true);


   try {

       const uid =
           currentUser.uid;


       const voteReference =
           doc(
               db,
               "votes",
               uid
           );


       /*
        * Verificação adicional.
        */

       const existingVote =
           await getDoc(
               voteReference
           );


       if (existingVote.exists()) {

           alreadyVoted = true;

           closeConfirmationModal();

           disableVotingInterface();

           showFirebaseError(
               "Este usuário já possui votos registrados."
           );

           return;
       }


       /*
        * GRAVA OS DOIS VOTOS.
        */

       await setDoc(
           voteReference,
           {
               nomeMasculino: selectedMale,
               nomeFeminino: selectedFemale,
               createdAt: serverTimestamp()
           }
       );


       /* =========================
          VOTOS SALVOS
          ========================= */

       alreadyVoted = true;


       const votedMale =
           selectedMale;

       const votedFemale =
           selectedFemale;


       closeConfirmationModal();


       disableVotingInterface();


       showSuccessScreen(
           votedMale,
           votedFemale
       );


       console.log(
           "Votos registrados:",
           votedMale,
           votedFemale
       );


   } catch (error) {

       console.error(
           "Erro ao registrar votos:",
           error
       );

       handleVoteError(error);

   } finally {

       isSavingVote = false;

       setConfirmButtonLoading(false);
   }
}


/* =========================
  CONFIRM BUTTON LOADING
  ========================= */

function setConfirmButtonLoading(
   isLoading
) {

   if (isLoading) {

       confirmButton.disabled =
           true;

       confirmButton.dataset.originalText =
           confirmButton.textContent;

       confirmButton.textContent =
           "Registrando...";

   } else {

       confirmButton.disabled =
           false;

       if (
           confirmButton.dataset.originalText
       ) {

           confirmButton.textContent =
               confirmButton.dataset.originalText;
       }
   }
}


/* =========================
  DISABLE VOTING
  ========================= */

function disableVotingInterface() {

   nameButtons.forEach((button) => {

       button.disabled =
           true;

       button.style.pointerEvents =
           "none";

       button.style.opacity =
           "0.45";
   });


   openConfirmationButton.disabled =
       true;

   openConfirmationButton.textContent =
       "Votos já registrados";


   console.log(
       "Votação bloqueada para este usuário."
   );
}


/* =========================
  ENABLE VOTING
  ========================= */

function enableVotingInterface() {

   nameButtons.forEach((button) => {

       button.disabled =
           false;

       button.style.pointerEvents =
           "";

       button.style.opacity =
           "";
   });


   openConfirmationButton.disabled =
       true;

   updateConfirmationButton();
}


/* =========================
  SUCCESS SCREEN
  ========================= */

function showSuccessScreen(
   maleName,
   femaleName
) {

   confirmedMale.textContent =
       maleName;

   confirmedFemale.textContent =
       femaleName;


   successOverlay.classList.remove(
       "hidden"
   );

   successOverlay.setAttribute(
       "aria-hidden",
       "false"
   );

   document.body.style.overflow =
       "hidden";


   clearAnimationLayer();


   /*
    * Como agora existem dois votos,
    * mostramos as duas animações.
    */

   createSoccerAnimation();

   createFemaleConfetti();
}


/* =========================
  CLEAR ANIMATION
  ========================= */

function clearAnimationLayer() {

   animationLayer.innerHTML =
       "";
}


/* =========================
  SOCCER ANIMATION
  ========================= */

function createSoccerAnimation() {

   const numberOfBalls =
       8;


   for (
       let i = 0;
       i < numberOfBalls;
       i++
   ) {

       const ball =
           document.createElement(
               "div"
           );

       ball.className =
           "soccer-ball";

       ball.textContent =
           "⚽";


       const randomTop =
           Math.random() * 100;

       const randomDelay =
           Math.random() * 1.5;

       const randomDuration =
           2.2 +
           Math.random() * 2.5;

       const randomSize =
           20 +
           Math.random() * 25;


       ball.style.top =
           `${randomTop}%`;

       ball.style.fontSize =
           `${randomSize}px`;

       ball.style.animationDelay =
           `${randomDelay}s`;

       ball.style.animationDuration =
           `${randomDuration}s`;


       animationLayer.appendChild(
           ball
       );
   }
}


/* =========================
  FEMALE CONFETTI
  ========================= */

function createFemaleConfetti() {

   const symbols = [
       "🎀",
       "✨",
       "🎉",
       "💜",
       "💗",
       "✦"
   ];


   const numberOfPieces =
       50;


   for (
       let i = 0;
       i < numberOfPieces;
       i++
   ) {

       const confetti =
           document.createElement(
               "div"
           );

       confetti.className =
           "confetti";


       confetti.textContent =
           symbols[
               Math.floor(
                   Math.random() *
                   symbols.length
               )
           ];


       const randomLeft =
           Math.random() * 100;

       const randomDelay =
           Math.random() * 2.5;

       const randomDuration =
           2.5 +
           Math.random() * 3;

       const randomSize =
           14 +
           Math.random() * 18;

       const randomDrift =
           -150 +
           Math.random() * 300;


       confetti.style.left =
           `${randomLeft}%`;

       confetti.style.fontSize =
           `${randomSize}px`;

       confetti.style.animationDelay =
           `${randomDelay}s`;

       confetti.style.animationDuration =
           `${randomDuration}s`;

       confetti.style.setProperty(
           "--drift",
           `${randomDrift}px`
       );


       animationLayer.appendChild(
           confetti
       );
   }
}


/* =========================
  FIREBASE ERROR
  ========================= */

function showFirebaseError(message) {

   console.error(message);

   alert(message);
}


/* =========================
  VOTE ERROR HANDLER
  ========================= */

function handleVoteError(error) {

   if (!error) {

       showFirebaseError(
           "Não foi possível registrar seus votos."
       );

       return;
   }


   console.error(
       "Firebase error code:",
       error.code
   );


   switch (error.code) {

       case "permission-denied":

           showFirebaseError(
               "Seu voto não pôde ser registrado. Verifique se você já votou."
           );

           break;


       case "unauthenticated":

           showFirebaseError(
               "Sua sessão não está autenticada. Recarregue a página."
           );

           break;


       case "unavailable":

           showFirebaseError(
               "O Firebase está temporariamente indisponível. Tente novamente."
           );

           break;


       default:

           showFirebaseError(
               "Não foi possível registrar seus votos. Tente novamente."
           );

           break;
   }
}


/* =========================
  DEBUG INFORMATION
  ========================= */

console.log(
   "%cBABY VOTE",
   "font-size: 24px; font-weight: 900;"
);

console.log(
   "Sistema carregado."
);

console.log(
   "Projeto Firebase:",
   firebaseConfig.projectId
);
