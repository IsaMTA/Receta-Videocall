import { Component} from '@angular/core';
//Dependencias necesarias para conversión a PDF
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

import firebase from 'firebase/app';
import 'firebase/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  //Datos a desplegar en la receta
  doctor = 'Edgar Hernández Zamora.'
  paciente = 'Sergio Ruvalcaba Lozano';
  diagnostico = 'Miagraña';
  tratamiento: Array<string> = ['Tabcin 2 tabletas cada 8 horas por 5 días.',
  'Lasmiditan 1 tableta cada 8 horas por 5 días.'];

  //Datos de la fecha
  fecha = new Date();
  dia = this.fecha.getDay();
  mes = this.fecha.getMonth();
  anio = this.fecha.getFullYear();
  hrs = this.fecha.getHours();
  mins = this.fecha.getMinutes();

  //Función encargada de convertir el HTML como imagen, o captura de pantalla
  exportAsPDF(div_id)
  {
    //Se obtiene la información del bloque HTML con el id enviado como parámetro
    let data = document.getElementById(div_id);  
    html2canvas(data).then(canvas => {
      // Opciones para el tamaño de la imagen
      var imgWidth = 208;
      var pageHeight = 295;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      var heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png')  
      let pdf = new jspdf.jsPDF('p', 'mm', 'letter');// Genera PDF con orientación vertical
      pdf.addImage(contentDataURL, 'PNG', 5, 20, imgWidth, imgHeight);
      pdf.save('Receta Médica.pdf');   
    }); 
  }
 
}

