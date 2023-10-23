async function getProjects() {
  const data = [
    {
      url: 'https://baidu.com',
    },
    {
      url: 'https://google.com',
    },
  ]

  return data
}

export default async function Index() {
  const projects = await getProjects()

  return projects.map(project => <div>{project.url}</div>)
}
