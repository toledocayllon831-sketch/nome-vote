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

const nameButtons = document.querySelectorAll(".name-button");

const confirmationModal =
   document.getElementById("confirmationModal");

const selectedNameElement =
   document.getElementById("selectedName");

const modalIcon =
   document.getElementById("modalIcon");

const cancelButton =
   document.getElementById("cancelButton");

const confirmButton =
   document.getElementById("confirmButton");

const successOverlay =
   document.getElementById("successOverlay");

const confirmedName =
   document.getElementById("confirmedName");

const animationLayer =
   document.getElementById("animationLayer");


/* =========================
  APPLICATION STATE
  ========================= */

let currentUser = null;

let selectedName = null;

let selectedGender = null;

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

       console.log("Autenticação anônima iniciada.");

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

           disableVotingInterface(
               voteData.name
           );

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
               "Você já registrou seu voto."
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

       selectedName = name;

       selectedGender = gender;

       openConfirmationModal(
           name,
           gender
       );
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
  OPEN CONFIRMATION MODAL
  ========================= */

function openConfirmationModal(name, gender) {

   selectedNameElement.textContent =
       name;

   if (gender === "male") {

       modalIcon.textContent = "⚽";

   } else {

       modalIcon.textContent = "🎀";
   }

   confirmationModal.classList.remove(
       "hidden"
   );

   confirmationModal.setAttribute(
       "aria-hidden",
       "false"
   );

   document.body.style.overflow = "hidden";
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

   document.body.style.overflow = "";

   selectedName = null;

   selectedGender = null;
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
  CONFIRM VOTE
  ========================= */

confirmButton.addEventListener(
   "click",
   async () => {

       await submitVote();
   }
);


/* =========================
  SUBMIT VOTE
  ========================= */

async function submitVote() {

   if (isSavingVote) {
       return;
   }

   if (alreadyVoted) {

       showFirebaseError(
           "Você já registrou seu voto."
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

   if (!selectedName || !selectedGender) {

       showFirebaseError(
           "Selecione um nome novamente."
       );

       return;
   }

   if (
       !isValidName(
           selectedName,
           selectedGender
       )
   ) {

       showFirebaseError(
           "Nome de votação inválido."
       );

       return;
   }


   isSavingVote = true;

   setConfirmButtonLoading(true);


   try {

       const uid = currentUser.uid;

       const voteReference =
           doc(
               db,
               "votes",
               uid
           );


       /*
        * Verificação adicional antes da gravação.
        *
        * A proteção definitiva também ficará
        * nas Firestore Security Rules.
        */

       const existingVote =
           await getDoc(voteReference);

       if (existingVote.exists()) {

           alreadyVoted = true;

           const existingData =
               existingVote.data();

           closeConfirmationModal();

           disableVotingInterface(
               existingData.name
           );

           showFirebaseError(
               "Este usuário já possui um voto registrado."
           );

           return;
       }


       /*
        * Grava o voto.
        *
        * O UID fica como ID do documento.
        * createdAt usa o timestamp do servidor.
        */

       await setDoc(
           voteReference,
           {
               name: selectedName,
               gender: selectedGender,
               createdAt: serverTimestamp()
           }
       );


       /* =========================
          VOTO SALVO
          ========================= */

       alreadyVoted = true;

       const votedName = selectedName;

       const votedGender = selectedGender;


       closeConfirmationModal();


       disableVotingInterface(
           votedName
       );


       showSuccessScreen(
           votedName,
           votedGender
       );


       console.log(
           "Voto registrado com sucesso:",
           votedName
       );


   } catch (error) {

       console.error(
           "Erro ao registrar voto:",
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

function setConfirmButtonLoading(isLoading) {

   if (isLoading) {

       confirmButton.disabled = true;

       confirmButton.dataset.originalText =
           confirmButton.textContent;

       confirmButton.textContent =
           "Registrando...";

   } else {

       confirmButton.disabled = false;

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

function disableVotingInterface(votedName) {

   nameButtons.forEach((button) => {

       button.disabled = true;

       button.style.pointerEvents = "none";

       button.style.opacity = "0.45";
   });

   console.log(
       `Votação bloqueada. Voto: ${votedName}`
   );
}


/* =========================
  ENABLE VOTING
  ========================= */

function enableVotingInterface() {

   nameButtons.forEach((button) => {

       button.disabled = false;

       button.style.pointerEvents = "";

       button.style.opacity = "";
   });
}


/* =========================
  SUCCESS SCREEN
  ========================= */

function showSuccessScreen(
   name,
   gender
) {

   confirmedName.textContent = name;

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


   if (gender === "male") {

       createSoccerAnimation();

   } else {

       createFemaleConfetti();
   }
}


/* =========================
  CLEAR ANIMATION
  ========================= */

function clearAnimationLayer() {

   animationLayer.innerHTML = "";
}


/* =========================
  SOCCER ANIMATION
  ========================= */

function createSoccerAnimation() {

   const numberOfBalls = 12;

   for (
       let i = 0;
       i < numberOfBalls;
       i++
   ) {

       const ball =
           document.createElement("div");

       ball.className =
           "soccer-ball";

       ball.textContent = "⚽";


       const randomTop =
           Math.random() * 100;

       const randomDelay =
           Math.random() * 1.5;

       const randomDuration =
           2.2 + Math.random() * 2.5;

       const randomSize =
           25 + Math.random() * 30;


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

   const numberOfPieces = 70;


   for (
       let i = 0;
       i < numberOfPieces;
       i++
   ) {

       const confetti =
           document.createElement("div");

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
           2.5 + Math.random() * 3;

       const randomSize =
           14 + Math.random() * 18;

       const randomDrift =
           -150 + Math.random() * 300;


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

   /*
    * Por enquanto usamos alert para não
    * adicionar elementos novos ao HTML.
    *
    * Podemos substituir isso por um toast
    * futurista depois.
    */

   alert(message);
}


/* =========================
  VOTE ERROR HANDLER
  ========================= */

function handleVoteError(error) {

   if (!error) {

       showFirebaseError(
           "Não foi possível registrar seu voto."
       );

       return;
   }


   console.error(
       "Firebase error code:",
       error.code
   );


   switch (error.code) {

       case "permission-denied":

           alreadyVoted = true;

           disableVotingInterface(
               selectedName || "este nome"
           );

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
               "Não foi possível registrar seu voto. Tente novamente."
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