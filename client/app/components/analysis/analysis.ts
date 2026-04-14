import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DayData {
  day: string;
  count: number;
}

interface TagData {
  [key: string]: DayData[];
}

@Component({
  selector: 'app-analysis',
  imports: [CommonModule, FormsModule],
  templateUrl: './analysis.html',
  styleUrl: './analysis.css'
})
export class AnalysisComponent {
  selectedTag = 'survive';

  // Fake data for each default tag
  tagData: TagData = {
    'survive': [
      { day: 'Mon', count: 8 },
      { day: 'Tue', count: 6 },
      { day: 'Wed', count: 10 },
      { day: 'Thu', count: 7 },
      { day: 'Fri', count: 9 },
      { day: 'Sat', count: 5 },
      { day: 'Sun', count: 4 }
    ],
    'happy house': [
      { day: 'Mon', count: 3 },
      { day: 'Tue', count: 5 },
      { day: 'Wed', count: 4 },
      { day: 'Thu', count: 6 },
      { day: 'Fri', count: 3 },
      { day: 'Sat', count: 7 },
      { day: 'Sun', count: 8 }
    ],
    'strong body': [
      { day: 'Mon', count: 2 },
      { day: 'Tue', count: 3 },
      { day: 'Wed', count: 2 },
      { day: 'Thu', count: 4 },
      { day: 'Fri', count: 3 },
      { day: 'Sat', count: 5 },
      { day: 'Sun', count: 4 }
    ],
    'sharp mind': [
      { day: 'Mon', count: 5 },
      { day: 'Tue', count: 7 },
      { day: 'Wed', count: 6 },
      { day: 'Thu', count: 8 },
      { day: 'Fri', count: 9 },
      { day: 'Sat', count: 3 },
      { day: 'Sun', count: 2 }
    ],
    'create': [
      { day: 'Mon', count: 4 },
      { day: 'Tue', count: 3 },
      { day: 'Wed', count: 7 },
      { day: 'Thu', count: 5 },
      { day: 'Fri', count: 6 },
      { day: 'Sat', count: 4 },
      { day: 'Sun', count: 5 }
    ]
  };

  defaultTags = ['survive', 'happy house', 'strong body', 'sharp mind', 'create'];

  getCurrentData(): DayData[] {
    return this.tagData[this.selectedTag] || [];
  }

  getMaxCount(): number {
    const data = this.getCurrentData();
    return Math.max(...data.map(d => d.count), 1);
  }

  getBarHeight(count: number): number {
    const max = this.getMaxCount();
    return (count / max) * 100;
  }

  getTotalTasks(): number {
    const data = this.getCurrentData();
    return data.reduce((sum, d) => sum + d.count, 0);
  }

  getDailyAverage(): number {
    const total = this.getTotalTasks();
    return Math.round((total / 7) * 10) / 10;
  }
}
