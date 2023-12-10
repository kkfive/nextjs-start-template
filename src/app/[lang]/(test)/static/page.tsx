async function getProjects() {
  return [
    {
      url: 'https://baidu.com',
    },
    {
      url: 'https://google.com',
    },
  ]
}

export default async function Index() {
  const projects = await getProjects()

  return projects.map(project => <div key={project.url}>{project.url}</div>)
}
