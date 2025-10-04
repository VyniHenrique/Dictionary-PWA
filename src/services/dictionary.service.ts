import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {

  // URLs base das APIs
  private readonly apiUrlEnglish = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

  // Injetamos o HttpClient no construtor para poder usá-lo
  constructor(private http: HttpClient) { }

  /**
   * Busca a definição de uma palavra em inglês.
   * @param word A palavra a ser pesquisada.
   * @returns Um Observable com a resposta da API (geralmente um array).
   */
  getEnglishDefinition(word: string): Observable<any> {
    const url = `${this.apiUrlEnglish}${word}`;
    return this.http.get(url);
  }

}
