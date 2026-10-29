export function GET() {
  return Response.json({
    name: "Portfolio API",
    version: "v1",
    envelope: "Successful responses are { data }, errors are { error: { message, details } }.",
    public: {
      "GET /api/v1/site": "Profile, services, featured projects, experience, skills and latest posts in one call",
      "GET /api/v1/profile": "Owner profile and site settings",
      "GET /api/v1/projects?featured=1": "Published projects",
      "GET /api/v1/projects/:slug": "One project with its case study and neighbours",
      "GET /api/v1/experience": "Career timeline",
      "GET /api/v1/services": "Services",
      "GET /api/v1/skills": "Skills grouped by category",
      "GET /api/v1/posts?limit=n": "Published posts",
      "GET /api/v1/posts/:slug": "One post with Markdown content",
      "GET /api/v1/github": "GitHub activity for the configured username (cached 1h)",
      "POST /api/v1/contact": "{ name, email, company?, budget?, message }",
    },
    admin: {
      auth: "Session cookie from POST /api/v1/admin/login, or Authorization: Bearer ADMIN_API_TOKEN",
      "POST /api/v1/admin/login": "{ email, password }",
      "POST /api/v1/admin/logout": "",
      "GET|PUT /api/v1/admin/profile": "",
      "GET|POST /api/v1/admin/:resource": "resource = projects | experience | services | skills | posts",
      "GET|PUT|DELETE /api/v1/admin/:resource/:id": "",
      "GET /api/v1/admin/messages": "Contact inbox",
      "PATCH|DELETE /api/v1/admin/messages/:id": "{ read }",
      "POST /api/v1/admin/upload": "multipart field “file”; images or PDF up to 8 MB",
      "GET /api/v1/admin/stats": "Counts for the dashboard",
    },
  });
}
