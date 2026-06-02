---
layout: subpage
title: Background
permalink: /background/
---

<h1 class="subpage-title">Background</h1>
<p class="subpage-lead">Publications, awards, and academic work.</p>

<h2 class="section-subtitle">Publications</h2>
<div class="publication-list">
  {% for link in site.data.publications.main %}
  <article class="publication-card">
    {% if link.image %}
    <img src="{{ link.image }}" alt="{{ link.title }} preview" loading="lazy" width="132" height="88">
    {% endif %}
    <div>
      <a href="{{ link.pdf }}" target="_blank" rel="noopener">{{ link.title }}</a>
      <p>{{ link.authors | strip_html }}</p>
      <small>{{ link.conference | strip_html }} · {{ link.notes }}</small>
    </div>
  </article>
  {% endfor %}
</div>

<h2 class="section-subtitle">Awards</h2>
<ul class="compact-award-list">
  <li><strong>1st Prize</strong> — Subway Passenger Flow Prediction, Guangxi Collegiate AI Design Competition 2020</li>
  <li><strong>2nd Prize</strong> — Legal Case Retrieval Task, Challenge of AI in Law (CAIL) 2021</li>
  <li><strong>2nd Prize</strong> — CSI Index Prediction, Guangxi Collegiate AI Design Competition 2019</li>
  <li><strong>3rd Prize</strong> — Information Extraction Task, Challenge of AI in Law (CAIL) 2021</li>
  <li><strong>3rd Prize</strong> — Judicial Examination Task, Challenge of AI in Law (CAIL) 2021</li>
</ul>
