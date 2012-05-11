var GitHubTimelineApi;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
GitHubTimelineApi = (function() {
  function GitHubTimelineApi() {}
  GitHubTimelineApi.prototype._strongify = function(string) {
    return '<strong>' + string + '</strong>';
  };
  GitHubTimelineApi.prototype.formatAsTimeAgo = function(date) {
    var day_diff, diff;
    diff = ((new Date).getTime() - date.getTime()) / 1000;
    day_diff = Math.floor(diff / 86400);
    if ((isNaN(day_diff)) || (day_diff < 0)) {
      return null;
    }
    if (day_diff === 0) {
      if (diff < 60) {
        return "just now";
      } else if (diff < 120) {
        return "1 minute ago";
      } else if (diff < 3600) {
        return "" + (Math.floor(diff / 60)) + " minutes ago";
      } else if (diff < 7200) {
        return "1 hour ago";
      } else if (diff < 86400) {
        return "" + (Math.floor(diff / 3600)) + " hours ago";
      }
    } else if (day_diff === 1) {
      return "Yesterday";
    } else if (day_diff < 7) {
      return "" + day_diff + " days ago";
    } else {
      return "" + (Math.ceil(day_diff / 7)) + " weeks ago";
    }
  };
  GitHubTimelineApi.prototype._parseGitHubEvent = function(event) {
    var branch, icon_url, repository, text, timestamp, url, _ref;
    url = (event.url != null ? event.url : void 0) || (((_ref = event.payload) != null ? _ref.url : void 0) != null ? event.payload.url : void 0) || 'https://github.com';
    url = url.replace('github.com//', 'github.com/');
    timestamp = new Date((event.created_at != null ? event.created_at : void 0) || 0).valueOf();
    if (event.repository != null) {
      repository = this._strongify("" + event.repository.owner + "/" + event.repository.name);
    }
    switch (event.type) {
      case 'CreateEvent':
        icon_url = 'https://github.com/images/modules/dashboard/news/create.png';
        switch (event.payload.object) {
          case 'repository':
            text = "created repo " + repository;
            break;
          case 'tag':
            text = "created tag " + (this._strongify(event.payload.object_name)) + " at " + repository;
            break;
          case 'branch':
            text = "created branch " + (this._strongify(event.payload.object_name)) + " at " + repository;
        }
        break;
      case 'MemberEvent':
        switch (event.payload.action) {
          case 'added':
            icon_url = 'https://github.com/images/modules/dashboard/news/member_add.png';
            text = "added " + (this._strongify(event.payload.member)) + " to " + repository;
        }
        break;
      case 'PushEvent':
        branch = event.payload.ref.substr(event.payload.ref.lastIndexOf('/') + 1);
        icon_url = 'https://github.com/images/modules/dashboard/news/push.png';
        text = "pushed to " + (this._strongify(branch)) + " at " + repository;
        break;
      case 'ForkApplyEvent':
        icon_url = 'https://github.com/images/modules/dashboard/news/merge.png';
        text = "merged to " + repository;
        break;
      case 'ForkEvent':
        icon_url = 'https://github.com/images/modules/dashboard/news/fork.png';
        text = "forked " + repository;
        break;
      case 'WatchEvent':
        switch (event.payload.action) {
          case 'started':
            icon_url = 'https://github.com/images/modules/dashboard/news/watch_started.png';
            text = "started watching " + repository;
            break;
          case 'stopped':
            icon_url = 'https://github.com/images/modules/dashboard/news/watch_stopped.png';
            text = "stopped watching " + repository;
        }
        break;
      case 'FollowEvent':
        text = null;
        break;
      case 'IssuesEvent':
      case 'PullRequestEvent':
        switch (event.payload.action) {
          case 'opened':
          case 'reopened':
            icon_url = 'https://github.com/images/modules/dashboard/news/issues_opened.png';
            text = "opened issued on " + repository;
            break;
          case 'closed':
            icon_url = 'https://github.com/images/modules/dashboard/news/issues_closed.png';
            text = "closed issue on " + repository;
        }
        break;
      case 'GistEvent':
        icon_url = 'https://github.com/images/modules/dashboard/news/gist.png';
        switch (event.payload.action) {
          case 'create':
            text = "created " + (this._strongify(event.payload.name));
            break;
          case 'update':
            text = "updated " + (this._strongify(event.payload.name));
            break;
          case 'fork':
            text = "forked " + (this._strongify(event.payload.name));
        }
        break;
      case 'WikiEvent':
      case 'GollumEvent':
        icon_url = 'https://github.com/images/modules/dashboard/news/wiki.png';
        switch (event.payload.action) {
          case 'created':
            text = "created a wiki page on " + repository;
            break;
          case 'edited':
            text = "edited a wiki page on " + repository;
        }
        break;
      case 'CommitCommentEvent':
        icon_url = 'https://github.com/images/modules/dashboard/news/comment.png';
        text = "commented on " + repository;
        break;
      case 'DeleteEvent':
        icon_url = 'https://github.com/images/modules/dashboard/news/delete.png';
        switch (event.payload.ref_type) {
          case 'branch':
            text = "deleted branch " + (this._strongify(event.payload.ref)) + " at " + repository;
        }
        break;
      case 'PublicEvent':
        icon_url = 'https://github.com/images/modules/dashboard/news/public.png';
        text = "open sourced " + repository;
        break;
      case 'DownloadEvent':
        text = null;
    }
    if (text != null) {
      return [url, icon_url, timestamp, text];
    } else {
      return [];
    }
  };
  GitHubTimelineApi.prototype._parseGitHubTimeline = function(data, callback) {
    var event, event_data, events, _i, _len;
    events = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      event = data[_i];
      event_data = this._parseGitHubEvent(event);
      if (event_data.length) {
        events.push(event_data);
      }
    }
    return callback(events);
  };
  GitHubTimelineApi.prototype.getTimelineForUser = function(user, callback) {
    jQuery.ajaxSetup({
      cache: true
    });
    return jQuery.getJSON('https://github.com/' + user + '.json?callback=?', __bind(function(data) {
      return this._parseGitHubTimeline(data, callback);
    }, this));
  };
  GitHubTimelineApi.prototype.getUserIdForUser = function(user, callback) {
    jQuery.ajaxSetup({
      cache: true
    });
    return jQuery.getJSON('https://github.com/api/v2/json/user/show/' + user + '?callback=?', __bind(function(data) {
      return callback(data.user.id);
    }, this));
  };
  return GitHubTimelineApi;
})();
jQuery.fn.githubTimelineWidget = function(options) {
  var defaults, script, script_path, scripts, _i, _len, _ref;
  defaults = {
    username: 'timeline',
    limit: 5,
    user_id: true
  };
  scripts = document.getElementsByTagName('script');
  for (_i = 0, _len = scripts.length; _i < _len; _i++) {
    script = scripts[_i];
    if ((_ref = script.src) != null ? _ref.match(/github-timeline-widget\.js/) : void 0) {
      script_path = script.src.replace(/github-timeline-widget\.js.*$/, '');
      break;
    }
  }
  if ((script_path != null) && false) {
    jQuery('<link/>').attr('rel', 'stylesheet').attr('type', 'text/css').attr('href', script_path + 'github-timeline-widget.css').prependTo('head');
  }
  return this.each(function() {
    var $this, api, it, list;
    it = this;
    $this = jQuery(this);
    it.opts = jQuery.extend({}, defaults, options);
    jQuery('<a>').attr('class', 'github-timeline-header').attr('href', "https://github.com/" + it.opts.username).text("" + it.opts.username + " on GitHub").appendTo($this);
    list = jQuery('<ul>').attr('class', 'github-timeline-events').appendTo($this);
    api = new GitHubTimelineApi;
    api.getTimelineForUser(it.opts.username, function(events) {
      var div_text, event, event_link, events_left, icon_url, list_item, text, timestamp, timestamp_ago, url, _j, _len2;
      events_left = it.opts.limit;
      for (_j = 0, _len2 = events.length; _j < _len2; _j++) {
        event = events[_j];
        if (events_left-- === 0) {
          break;
        }
        url = event[0], icon_url = event[1], timestamp = event[2], text = event[3];
        list_item = jQuery('<li>').attr('class', 'github-timeline-event').appendTo(list);
        event_link = jQuery('<a>').attr('href', url);
        if (icon_url && false) {
          jQuery('<img>').attr('src', icon_url).appendTo(list_item).wrap(jQuery('<div>').attr('class', 'github-timeline-event-icon')).wrap(event_link);
        }
        div_text = jQuery('<div>').attr('class', 'github-timeline-event-text').html(text).appendTo(list_item).wrapInner(event_link);
        if (timestamp) {
          timestamp_ago = api.formatAsTimeAgo(new Date(timestamp));
          if (timestamp_ago) {
            jQuery('<div>').attr('class', 'github-timeline-event-time').text(timestamp_ago).appendTo(div_text);
          }
        }
      }
      return jQuery('<a>').attr('class', 'github-timeline-source-link').attr('href', 'https://github.com/alindeman/github-timeline-widget').text('GitHub Timeline Widget').appendTo($this);
    });
    if (it.opts.user_id) {
      return api.getUserIdForUser(it.opts.username, function(user_id) {
        jQuery('<br/>').appendTo('.github-timeline-header');
        return jQuery('<span>').attr('class', 'github-timeline-header-user-id').text("(user #" + user_id + ")").appendTo('.github-timeline-header');
      });
    }
  });
};
