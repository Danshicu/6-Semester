import streamlit as st
from st_pages import Page, show_pages


class WelcomePage:

    def __init__(self) -> None:
        st.set_page_config(page_title='Welcome page',page_icon='🤗', layout='wide')
        self._page_list = [
            Page('app.py', name='Welcome page', icon='🤗'),
            Page('app/frontend/main_view.py', name='Text corpus query', icon='🧾'),
            Page('app/frontend/modify_word_stats_view.py', name='Modify text corpus stats', icon='🛠️'),
            Page('app/frontend/update_text_corpus_view.py',
                 name='Upload new texts to corpus', icon='📝')
        ]
    

    def run(self):
        show_pages(self._page_list)
        st.write('### Welcome!')
        st.info('### Welcome to text corpus manager application!\n'
                '#### There is prepared and processed corpus, but user can add '
                'theirs own text and process it via \'Upload new texts to corpus\' '
                'page. If you want to lookup for words from user phrases, visit '
                '\'Text corpus query\' page. '
                'If user finds mistakes made during text processing, \'Modify text corpus stats\' '
                'page could be visited to correct word forms, lemmas, part of speech, '
                'grammatical features and frequency parameters.')


welcome_page = WelcomePage()
welcome_page.run()
