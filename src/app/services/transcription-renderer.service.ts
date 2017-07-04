import { Injectable }  from '@angular/core';

import { environment } from '../../environments/environment';

import { Sample }      from '../models/sample';


@Injectable()
export class TranscriptionRendererService {

  public renderTranscription(sample: Sample): string {
    const turns = [],
          participants = Object.assign(
            {},
            ...sample.students.map(function(obj) { return {[obj.uuid]: obj}; }),
            ...sample.adults.map(function(obj) { return {[obj.uuid]: obj}; })
          ),
          transcriptionXmlDoc: any = this._getTranscriptionXmlDoc(sample);

    const turnsXML = transcriptionXmlDoc.getElementsByTagName('turn');
    for (let i = 0, il = turnsXML.length; i < il; i++) {
      const turn = turnsXML[i];
      const turnContent = turn.innerHTML.replace(/<note>/g, '<span class="note">').replace(/<\/note>/g, '</span>');
      const turnHtml = `
      <tr class="p_${turn.attributes.spkr.nodeValue}">
        <th>${i + 1}</th>
        <td class="transcription-participant">
          <img src="${environment.mediaURL}${participants[turn.attributes.spkr.nodeValue].avatar}" height="25px">
          ${participants[turn.attributes.spkr.nodeValue].nickname}
        </td>
        <td>${turnContent}</td>
      </tr>
      `;
      turns.push(turnHtml);
    }

    return `<table class="transcription">${turns.join('')}</table>`;
  }


  public countTurns(sample: Sample): number {
    return this._getTranscriptionXmlDoc(sample).getElementsByTagName('turn').length;
  }


  private _getTranscriptionXmlDoc(sample: Sample): any {
    let transcriptionXmlDoc: any;

    if (window.DOMParser) {
      transcriptionXmlDoc = new DOMParser().parseFromString(sample.transcription, 'text/xml');
    } else { // Internet Explorer
      transcriptionXmlDoc = new ActiveXObject('Microsoft.XMLDOM');
      transcriptionXmlDoc.async = false;
      transcriptionXmlDoc.loadXML(sample.transcription);
    }
    return transcriptionXmlDoc;
  }

}
