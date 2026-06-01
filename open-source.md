---
layout: subpage
title: Open Source
permalink: /open-source/
---

<h1 class="subpage-title">Open Source</h1>
<p class="subpage-lead">Tools I build in the open. Small, sharp, and useful.</p>

<div class="project-grid">
  {% for project in site.data.projects.highlight %}
  <article class="project-card{% if forloop.first %} hero-card{% endif %}">
    <div class="project-header">
      <a href="{{ project.url }}" class="project-title" target="_blank" rel="noopener">{{ project.name }}</a>
      <span class="project-stars">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
        </svg>
        {{ project.stars }}
      </span>
    </div>
    <p class="project-description">{{ project.description }}</p>
    {% if forloop.first %}
    <code class="cli-snippet">$ buddy status
🐶 Buddy is watching your rhythm. Session #47.</code>
    {% endif %}
    <div class="project-meta">
      <span class="project-language">
        <span class="lang-dot lang-{{ project.language | downcase }}"></span>
        {{ project.language }}
      </span>
      {% if project.updated %}
      <span class="project-updated">Updated {{ project.updated | date: "%b %Y" }}</span>
      {% endif %}
    </div>
  </article>
  {% endfor %}
</div>

<div class="contribution-strip">
  <strong>Kotaemon Contributor</strong>
  <span>Top contributor experience in an open-source RAG document chat project, alongside tools such as Open-OmniSearch and GraphRAG visualization work.</span>
</div>
