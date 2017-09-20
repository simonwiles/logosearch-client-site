import { Injectable }  from '@angular/core';

@Injectable()
export class NotificationsService {
  public notifications: any[] = [];

  public success(title: string, content?: string, options?: any) {
    this.notifications.push(this.buildNotification('success', title, content, undefined, options));
  }

  public alert(title: string, content?: string, options?: any) {
    this.notifications.push(this.buildNotification('alert', title, content, undefined, options));
  }

  public error(title: string, content?: string, options?: any) {
    this.notifications.push(this.buildNotification('error', title, content, undefined, options));
  }

  public info(title: string, content?: string, options?: any) {
    this.notifications.push(this.buildNotification('info', title, content, undefined, options));
  }

  public warn(title: string, content?: string, options?: any) {
    this.notifications.push(this.buildNotification('warn', title, content, undefined, options));
  }

  public html(html: any, type = null, options?: any) {
    this.notifications.push(this.buildNotification(type, undefined, undefined, html, options));
  }

  public clear(id?: string) {
    if (id) {
      this.notifications = this.notifications.filter(notification => notification.id !== id);
    } else {
      this.notifications = [];
    }
  }

  private buildNotification(type: string, title?: string, content?: string, html?: string, options?: any) {
    const id = Math.random().toString(36).substring(3);
    return {
      id: id,
      type: type,
      title: title,
      content: content,
      html: html,
      options: options,
      remove: () => this.clear(id)
    }
  }

}
