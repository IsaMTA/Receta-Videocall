import { Component, OnInit, ElementRef, Renderer2, ViewChild  } from '@angular/core';

import firebase from 'firebase/app';
import 'firebase/firestore';

@Component({
  selector: 'app-generapdf',
  templateUrl: './generapdf.component.html',
  styleUrls: ['./generapdf.component.css']
})
export class GenerapdfComponent implements OnInit {

  ngOnInit(): void {
  }

  
  firebaseConfig = {
    apiKey: "AIzaSyDDesnbVv3iwWUw198fXQSeDhsRIgGbdVs",
    authDomain: "webrtc-test-39226.firebaseapp.com",
    databaseURL: "https://webrtc-test-39226-default-rtdb.firebaseio.com",
    projectId: "webrtc-test-39226",
    storageBucket: "webrtc-test-39226.appspot.com",
    messagingSenderId: "432096020213",
    appId: "1:432096020213:web:b29f3bbf98e620f2d3e7bc",
    measurementId: "G-PSQ4KZKNSN"
  };
  
  firestore = null;

  servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  localStream = null;
  remoteStream = null;

   // Estado Global
   pc = new RTCPeerConnection(this.servers);
  
   // Elementos HTML
   @ViewChild('webcamButton') webcamButton: ElementRef;
   @ViewChild('webcamVideo') webcamVideo: ElementRef;
   @ViewChild('callButton') callButton: ElementRef;
   @ViewChild('callInput')  callInput: ElementRef;
   @ViewChild('answerButton') answerButton: ElementRef;
   @ViewChild('remoteVideo') remoteVideo: ElementRef;
   @ViewChild('hangupButton') hangupButton: ElementRef;

// 1. Configuración de las fuentes de medios

constructor(private renderer:Renderer2) { 
  if (!firebase.apps.length) {
    firebase.initializeApp(this.firebaseConfig);
  }
  this.firestore = firebase.firestore();
}

  async iniciarCamara() {
    console.log("Inicia camara");
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.remoteStream = new MediaStream();

    // Empujar pistas de la transmisión local a la conexión entre pares
    this.localStream.getTracks().forEach((track) => {
      this.pc.addTrack(track, this.localStream);
    });

    // Extraer pistas de la transmisión remota, añadiendo a la transmisión de video
    this.pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
    };

    this.renderer.setAttribute(this.webcamVideo.nativeElement, "srcObject", this.localStream);
    this.renderer.setAttribute(this.remoteVideo.nativeElement, "srcObject", this.remoteStream);

    this.renderer.setAttribute(this.callButton.nativeElement, "disabled", "false");
    this.renderer.setAttribute(this.answerButton.nativeElement, "disabled", "false");
    this.renderer.setAttribute(this.webcamButton.nativeElement, "disabled", "true");
  };

    // 2. Creando oferta
    async llamar() {
      // Colecciones de referencia de Firestore para señalización
      const callDoc = this.firestore.collection('calls').doc();
      const offerCandidates = callDoc.collection('offerCandidates');
      const answerCandidates = callDoc.collection('answerCandidates');
    
      this.renderer.setAttribute(this.callInput.nativeElement, "value", callDoc.id);
    
      // Obtener candidatos para llamadas, guardar en db
      this.pc.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
      };
    
      // Crear oferta
      const offerDescription = await this.pc.createOffer();
      await this.pc.setLocalDescription(offerDescription);
    
      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };
    
      await callDoc.set({ offer });
    
      // Escuchando la respuesta remota
      callDoc.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!this.pc.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          this.pc.setRemoteDescription(answerDescription);
        }
      });
    
      // Cuando se responda, agregar un candidato a la conexión de pares
      answerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            this.pc.addIceCandidate(candidate);
          }
        });
      });
    
      this.renderer.setAttribute(this.hangupButton.nativeElement, "disabled", "false");
    
  }

  // 3. Responda la llamada con la ID única
  async contestar () {
    const callId = this.callInput.nativeElement.getAttribute("value");
    
    const callDoc = this.firestore.collection('calls').doc(callId);
    const answerCandidates = callDoc.collection('answerCandidates');
    const offerCandidates = callDoc.collection('offerCandidates');
  
    this.pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };
  
    const callData = (await callDoc.get()).data();
  
    const offerDescription = callData.offer;
    await this.pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
  
    const answerDescription = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answerDescription);
  
    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };
  
    await callDoc.update({ answer });
  
    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(change);
        if (change.type === 'added') {
          let data = change.doc.data();
          this.pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };



}
