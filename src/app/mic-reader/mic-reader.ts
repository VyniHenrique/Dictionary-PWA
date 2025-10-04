import { Component, OnDestroy, OnInit } from '@angular/core';
import { SpeechRecognitionService } from '../../services/mic.service';
import { finalize, Observable, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DictionaryService } from '../../services/dictionary.service';

@Component({
  selector: 'app-mic-reader',
  imports: [FormsModule, CommonModule],
  templateUrl: './mic-reader.html',
  styleUrl: './mic-reader.css',
  standalone: true
})
export class MicReader implements OnInit, OnDestroy {
  public isListening = false;
  public transcribedText = '';
  public error: string = '';
  public isSupported = true;
  private speechSubscription: Subscription = Subscription.EMPTY;
  protected resultado: any = null;
  protected isLoading: boolean = false;

  constructor(
    private speechService: SpeechRecognitionService,
    private dictionaryService: DictionaryService
  ) {}

  ngOnInit(): void {
    this.isSupported = this.speechService.initialize();
    if (!this.isSupported) {
      this.error = 'Seu navegador não suporta a API de reconhecimento de voz';
    }
  }

  private start(): void {
    this.isListening = true;
    this.speechSubscription = this.speechService.startListening().subscribe(
      (text) => {
        this.transcribedText = text;
      },
      (e) => {
        this.error = `Ocorrreu um erro: ${e}`;
      },
      () => {
        this.isListening = false;
      }
    );
  }

  private stop(): void {
    this.speechService.stopListening();
    if (this.speechSubscription) {
      this.speechSubscription.unsubscribe();
    }
    this.isListening = false;
  }

  changeStateListening(): void {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  ngOnDestroy(): void {
    if (this.speechSubscription) {
      this.speechSubscription.unsubscribe();
    }
  }

  buscarDefinicao(){
    this.isLoading = true;
    this.resultado = null;
    this.error = '';
    this.stop();

    let serviceCall: Observable<any>;

    serviceCall = this.dictionaryService.getEnglishDefinition(this.transcribedText);

    serviceCall.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        this.resultado = data;
        console.log("Dados recebidos: ", data);
      },
      error: (error) => {
        console.log("Ocorreu um erro: ", error);
        this.error = `Não foi possivel encontrar a palavra "${this.transcribedText}". Verifique a ortografia.`
      }
    })
  }

}
