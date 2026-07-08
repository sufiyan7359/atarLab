import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CatalogApiService, SearchSuggestions } from '../../../core/services/catalog-api.service';

// Not in the standard DOM lib typings — feature-detected at runtime, declared minimally here.
interface SpeechRecognitionResultLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  onresult: ((event: SpeechRecognitionResultLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

const DEBOUNCE_MS = 250;

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss',
})
export class SearchBoxComponent implements OnDestroy {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly router = inject(Router);

  query = signal('');
  suggestions = signal<SearchSuggestions | null>(null);
  suggestionsOpen = signal(false);
  listening = signal(false);
  voiceSupported = typeof window !== 'undefined' && !!(window.webkitSpeechRecognition ?? window.SpeechRecognition);

  private debounceTimer?: ReturnType<typeof setTimeout>;
  private recognition: SpeechRecognitionLike | null = null;

  onInput(value: string): void {
    this.query.set(value);
    clearTimeout(this.debounceTimer);
    if (!value.trim()) {
      this.suggestions.set(null);
      this.suggestionsOpen.set(false);
      return;
    }
    this.debounceTimer = setTimeout(() => void this.fetchSuggestions(value), DEBOUNCE_MS);
  }

  private async fetchSuggestions(q: string): Promise<void> {
    const res = await firstValueFrom(this.catalogApi.suggest(q));
    this.suggestions.set(res.data);
    this.suggestionsOpen.set(true);
  }

  onSearch(event: Event): void {
    event.preventDefault();
    const q = this.query().trim();
    if (!q) return;
    this.suggestionsOpen.set(false);
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  selectSuggestion(): void {
    this.suggestionsOpen.set(false);
  }

  closeSuggestions(): void {
    this.suggestionsOpen.set(false);
  }

  startVoiceSearch(): void {
    const SpeechRecognitionCtor = window.webkitSpeechRecognition ?? window.SpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    this.recognition = new SpeechRecognitionCtor() as SpeechRecognitionLike;
    this.recognition.lang = 'en-IN';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.query.set(transcript);
      this.onInput(transcript);
    };
    this.recognition.onerror = () => this.listening.set(false);
    this.recognition.onend = () => this.listening.set(false);

    this.listening.set(true);
    this.recognition.start();
  }

  ngOnDestroy(): void {
    clearTimeout(this.debounceTimer);
  }
}
