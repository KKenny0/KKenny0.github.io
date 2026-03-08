## Open Source Projects

<div class="project-grid">

{% for project in site.data.projects.highlight %}

<div class="project-card">
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
  <div class="project-meta">
    <span class="project-language">
      <span class="lang-dot lang-{{ project.language | downcase }}"></span>
      {{ project.language }}
    </span>
    <span class="project-updated">Updated {{ project.updated | date: "%b %Y" }}</span>
  </div>
</div>

{% endfor %}

</div>

<div class="tech-tags">
{% for tech in site.data.projects.tech_stack %}
<span class="tech-tag">{{ tech }}</span>
{% endfor %}
</div>
