import { Component, inject, OnInit } from '@angular/core';
import QRCode from 'qrcode';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Url } from '../../core/service/url';
import { UrlItem } from '../../core/models/url-item';

type SortOption = 'newest' | 'oldest' | 'most-clicks' | 'least-clicks';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly urlService = inject(Url);
  urls: UrlItem[] = [];
  searchTerm: string = '';
  sortBy: SortOption = 'newest';
  isLoading: boolean = false;
  isDeletingId: number | null = null;
  activeQrId: number | null = null;
  qrLoadingId: number | null = null;
  qrImageMap: Record<number, string> = {};

  message: { type: 'success' | 'danger'; text: string } | null = null;

  ngOnInit(): void {
    this.loadUrls();
  }
  get filteredUrls(): UrlItem[] {
    const query = this.searchTerm.toLowerCase();
    const filtered = this.urls.filter((item) => {
      if (!query) return true;
      return (
        item.original_url.toLowerCase().includes(query) ||
        item.short_code.toLowerCase().includes(query) ||
        item.short_url.toLowerCase().includes(query)
      );
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (this.sortBy === 'most-clicks') return b.clicks - a.clicks;
      if (this.sortBy === 'least-clicks') return a.clicks - b.clicks;
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return this.sortBy === 'oldest' ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }

  async toggleQr(item: UrlItem) {
    if (this.activeQrId === item.id) {
      this.activeQrId = null;
      return;
    }
    this.activeQrId = item.id;
    if (this.qrImageMap[item.id]) {
      return;
    }
    this.qrLoadingId = item.id;
    try {
      const qrDataUrl = await QRCode.toDataURL(item.short_url, {
        width: 220,
        margin: 1,
        color: {
          dark: '#f5663a',
          light: '#0f1113',
        },
      });
      this.qrImageMap[item.id] = qrDataUrl;
    } catch (error) {
      this.message = { type: 'danger', text: 'Failed to generate QR code.' };
      this.activeQrId = null;
    } finally {
      this.qrLoadingId = null;
    }
  }
  loadUrls() {
    this.isLoading = true;
    this.urlService.getUrls().subscribe({
      next: (response: { data: UrlItem[]; }) => {
        console.log(response.data);
        this.urls = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching URLs:', error);
        this.isLoading = false;
      },
    });
  }
  deleteUrl(id: number) {
    if (!confirm('Are you sure you want to delete this URL?')) {
      return;
    }
    this.isDeletingId = id;
    this.urlService.deleteUrl(id).subscribe({
      next: (response) => {
        this.message = { type: 'success', text: response.message };
        8;
        this.urls = this.urls.filter((url) => url.id !== id);
        this.isDeletingId = null;
      },
      error: (error) => {
        this.message = { type: 'danger', text: 'Failed to delete URL.' };
        this.isDeletingId = null;
      },
    });
  }
  async copyLink(shortUrl: string) {
    try {
      await navigator.clipboard.writeText(shortUrl);
      this.message = { type: 'success', text: 'Link copied to clipboard!' };
    } catch (error) {
      this.message = { type: 'danger', text: 'Failed to copy link.' };
    }
  }
  trackById(index: number, item: UrlItem): number {
    return item.id;
  }
}
