import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ContentApiService } from '../../core/services/content-api.service';
import { BlogPost } from '../../core/models/content.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-list.component.html',
  styleUrl: './blog.scss',
})
export class BlogListComponent implements OnInit {
  private readonly contentApi = inject(ContentApiService);

  posts = signal<BlogPost[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const res = await firstValueFrom(this.contentApi.getBlogPosts());
      this.posts.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }
}
