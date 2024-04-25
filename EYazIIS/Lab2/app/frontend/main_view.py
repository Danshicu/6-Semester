import streamlit as st
import pandas as pd
import os
from app.backend.text_ectractors import TextEctractor
from app.backend.processors import TextCorpusQueryHandler
import spacy


class MainView:

    def __init__(self) -> None:
        pass
    
    def run(self):
        st.set_page_config(page_title='Main view', layout='wide')
        st.write('### Choose the way of phrase prompting (manually/through file) 🔻')        
        text_upload_selector = st.selectbox(label='Choose way of text input',
                                            options=['Manual', 'Via file'],
                                            index=0,
                                            key='text_input_option')
        st.write('### Insert your phrase down there 🔻')
        if st.session_state.get('text_input_option') == 'Manual':
            self._render_extrude_text_via_text_input()
        elif st.session_state.get('text_input_option') == 'Via file':
            self._render_extrude_text_via_file()
        self._render_submit_text_upload_button()
        self._stats_placeholder = st.container(height=750, border=False)
        if not st.session_state.get('query_handler'):
            st.session_state['query_handler'] = TextCorpusQueryHandler()   

    def _render_extrude_text_via_text_input(self):
        text_area = st.text_area(label='Input text to analyze here',
                                 placeholder='Input text for analysis here.\n'
                                             'For example, \'Music\'',
                                 key='text_area_input_field'
                                )

    def _render_extrude_text_via_file(self):
        file_input = st.file_uploader(label='Upload your file with text here',
                                      type=['pdf', 'docx', 'txt', 'rtf', 'doc'],
                                      key='file_input_field')

    def _render_submit_text_upload_button(self):
        submit_button = st.button(label='Upload text', key='upload_text_btn',
                                  help='Upload your text to analysis',
                                  on_click=self._upload_text
                                  )
    
    def _upload_text(self):
        if st.session_state.get('text_input_option') == 'Manual':
            if text := st.session_state.get('text_area_input_field'):
                self._render_word_stats(text)
            else:
                st.error('Write something into text field first!')
        elif st.session_state.get('text_input_option') == 'Via file':
            if file := st.session_state.get('file_input_field'):                                                 
                self._render_word_stats(
                    TextEctractor.extract_text(file, file.type)
                )
            else:
                st.error('Upload your file first!')
    
    def _render_word_stats(self, phrase: str):        
        word_stats: dict = st.session_state.get('query_handler').query_word_stats(phrase)
        with self._stats_placeholder:
            st.write(f'Found {len(word_stats)} words')
            word_index = 1
            for word, info in word_stats.items():
                expander = st.expander(f'### {word_index}. {word.capitalize()}')
                expander.write(f'#### Lemma: {info['lemma']}. ' 
                               f'Lemma\'s absolute frequency: {info['lemma_frequency']}')
                expander.write(f'#### Derivatives from {info['lemma']} lemma: ')
                word_forms_stats: dict = info['word_forms_stats']
                if word_forms_stats:
                    for word_form, word_form_info in word_forms_stats.items():
                        expander.write(f'#### - Word: {word_form}. '
                                       f'Grammatical features: {spacy.explain(word_form_info['tag'])}. '
                                       f'Absolute frequency: {word_form_info['word_frequency']}.')
                else:
                    expander.write(f'#### There is no known derivatives of {info['lemma']} ' 
                                   f'met in uploaded texts.')
                word_index += 1


view = MainView()
view.run()
