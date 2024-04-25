import streamlit as st
from app.backend.processors import TextCorpusQueryHandler
from app.backend.configs_manager import ConfigsManager
import pandas as pd
import spacy


class ModifyView:

    def __init__(self) -> None:
        st.set_page_config(page_title='Modify statistics', layout='wide')
        if not st.session_state.get('modify_query_handler'):
            st.session_state['modify_query_handler'] = TextCorpusQueryHandler()
        if not st.session_state.get('configs_manager'):
            st.session_state['configs_manager'] = ConfigsManager()

    def run(self) -> None:
        st.write(f'## Modify text corpus stats')
        st.info('#### Want to define sense of tags like PROPN or NNP?\n'
                'Open spolier down below 🔽')
        
        # Tags explanation expander
        with st.expander('#### See the tags explanation'):
            pos_col, tag_col = st.columns(2)
            with pos_col:
                for pos in (st.session_state['configs_manager']
                            .pos_full_names.keys()):
                    st.write(f'{pos} = {spacy.explain(pos)}')
            with tag_col:
                for tag in (st.session_state['configs_manager']
                            .spacy_tag_list):
                    st.write(f'{tag} = {spacy.explain(tag)}')

        edited_word_stats = st.data_editor(
            st.session_state.get('modify_query_handler').get_raw_word_df(),
            column_config={
                'word': 'Word form',
                'lemma': 'Word\'s lemma',
                'part_of_speech': st.column_config.SelectboxColumn(
                    label='Part of speech',
                    options=(st.session_state.get('configs_manager')
                             .pos_full_names),
                    required=True
                ),
                'tag': st.column_config.SelectboxColumn(
                    label='Grammatical features',
                    options={tag: spacy.explain(tag) for tag in
                             (st.session_state.get('configs_manager')
                             .spacy_tag_list)},
                    required=True,                    
                ),
                'absolute_frequency': 'Absolute frequency'
            },
            use_container_width=True,
            height=750
        )
        st.button('Save changes', on_click=lambda: self._save_changes(edited_word_stats))

    def _save_changes(self, edited_df: pd.DataFrame) -> None:
        st.session_state.get('modify_query_handler').set_raw_word_df(edited_df)
        st.success('#### Your changes have been saved!')


modify_view = ModifyView()
modify_view.run()
