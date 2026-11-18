import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UrlItem } from '../../core/models/url-item';
import { Url } from '../../core/service/url';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly urlService = inject(Url);
  private readonly formBuilder = inject(FormBuilder);
  readonly urlForm = this.formBuilder.group({
    originalUrl: [
      '',
      [Validators.required, Validators.pattern(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i)],
    ],
  });
  createdLink: UrlItem | null = null;
  isSubmitting: boolean = false;
  apiMessage: { type: 'success' | 'danger'; text: string } | null = null;
  get hasUrlError(): boolean {
    const control = this.urlForm.get('originalUrl');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  shortenUrl() {
    console.log(this.urlForm.value);
    if (this.urlForm.invalid) {
      this.urlForm.markAllAsTouched();
      return;
    }
    const originalUrl = this.urlForm.value.originalUrl?.trim() ?? '';
    this.isSubmitting = true;
    this.apiMessage = null;
    this.urlService.shortenUrl(originalUrl).subscribe({
      next: (response) => {
        this.apiMessage = { type: 'success', text: response.message };
        this.createdLink = response.data;
        this.isSubmitting = false;
      },
      error: (error) => {
        this.apiMessage = {
          type: 'danger',
          text: error.error?.message || 'An error occurred while shortening the URL.',
        };
        this.isSubmitting = false;
      },
    });
  }
  async copyLink(shortUrl: string) {
    try {
      await navigator.clipboard.writeText(shortUrl);
      this.apiMessage = { type: 'success', text: 'Link copied to clipboard!' };
    } catch (error) {
      this.apiMessage = { type: 'danger', text: 'Failed to copy link.' };
    }
  }
}
