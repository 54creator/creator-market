import axios from 'axios';

export function fetch() {
  return axios.get('https://creator-market-8gjbtf6u86530f42-1257353814.ap-shanghai.app.tcloudbase.com/list.json');
}

export function fetchReadme(user, repo) {
  return axios.get(`https://get-github-readme-v2.now.sh/${user}/${repo}/?branch=master`);
}
