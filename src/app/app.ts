import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MicReader } from "./mic-reader/mic-reader";

@Component({
  selector: 'app-root',
  imports: [ MicReader],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('atv-coding');
}
