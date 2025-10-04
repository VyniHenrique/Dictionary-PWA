import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

// Declaração para que o TypeScript reconheça a API com prefixo webkit
declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  private recognition: any;
  private isListening = false;

  constructor(private ngZone: NgZone) {}

  public initialize(): boolean {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true; // Continua escutando mesmo após uma pausa na fala
      this.recognition.interimResults = true; // Retorna resultados parciais enquanto o usuário fala
      this.recognition.lang = 'en-US'; // Define o idioma para português do Brasil
      return true;
    }
    return false; // API não suportada
  }

  public startListening(): Observable<string> {
    if (!this.recognition) {
      // Retorna um observable de erro se a API não for suportada
      return new Observable(observer => observer.error('API de Reconhecimento de Voz não suportada.'));
    }

    if (this.isListening) {
      // Se já estiver escutando, apenas retorna um observable vazio para evitar iniciar múltiplos processos
      return new Observable(observer => observer.complete());
    }

    this.isListening = true;
    this.recognition.start();

    return new Observable(observer => {
      // Evento que retorna o resultado da transcrição
      this.recognition.onresult = (event: any) => {
        let final_transcript = '';
        let interim_transcript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }

        // Usamos NgZone para garantir que a detecção de mudanças do Angular funcione
        this.ngZone.run(() => {
          observer.next(final_transcript + interim_transcript);
        });
      };

      // Evento de erro
      this.recognition.onerror = (event: any) => {
        this.ngZone.run(() => {
          observer.error(event.error);
        });
      };

      // Evento disparado quando o reconhecimento termina
      this.recognition.onend = () => {
          this.isListening = false;
          this.ngZone.run(() => {
              observer.complete();
          });
      };

      // Função de cancelamento da inscrição para parar o reconhecimento
      return () => {
        if (this.isListening) {
          this.recognition.stop();
        }
      };
    });
  }

  public stopListening(): void {
    if (this.isListening) {
      this.recognition.stop();
    }
  }
}
