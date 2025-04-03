import requests
from bs4 import BeautifulSoup
import os

def scrape_script(url):
    response = requests.get(url)
    response.raise_for_status()  # HTTPエラーをチェック

    soup = BeautifulSoup(response.content, 'html.parser')
    
    # タイトルを取得
    title = soup.find('h2', class_='title').text + "\n\n"

    script_text = ""
    script_text += title

    entry_content = soup.find('div', class_='entrytext')
    if entry_content:
        paragraphs = entry_content.find_all('p')
        for p in paragraphs:
            script_text += p.text + "\n"

    print(title)
    try:
        title_text = title.split('–')[1].strip()
    except IndexError:
        title_text = title.split('-')[1].strip()
        
    return title_text, script_text

def get_all_episode_urls(url):
    response = requests.get(url)
    response.raise_for_status()  # HTTPエラーをチェック

    soup = BeautifulSoup(response.content, 'html.parser')

    # pages-2 idを持つdiv内部のpage_itemsを取得
    pages_div = soup.find('div', id='pages-2')
    page_items = pages_div.find_all('li', class_='page_item')

    episode_urls = []
    for item in page_items[1:]:
        # 各page_itemのリンクを取得
        link = item.find('a')
        if link:
            episode_url = link.get('href')
            episode_urls.append(episode_url)
    
    return episode_urls

if __name__ == "__main__":
    base_url = "https://bigbangtrans.wordpress.com/series-1-episode-1-pilot-episode/"
    urls = get_all_episode_urls(base_url)

    for url in urls:
        _, season, _, ep = url.split('/')[-2].split('-')[:4]
        print(f"Season: {season}, Episode: {ep}")

        if int(season) < 10:
            continue

        title, script = scrape_script(url)

        if script:
            # 2桁の数字に変換 (1 -> 01)
            season = int(season)
            ep = int(ep)
            out_dir = f"./data/season{season:02d}/{ep:02d}_{title}/"
            os.makedirs(out_dir, exist_ok=True)
            with open(os.path.join(out_dir, "script.txt"), "w", encoding="utf-8") as f:
                f.write(script)
        else:
            print("スクリプトを抽出できませんでした。") 