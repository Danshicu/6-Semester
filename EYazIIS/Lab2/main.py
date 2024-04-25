from app.backend.processors import TextCoprusProcessor, TextCorpusQueryHandler, TextCorpusStatsCreator

# proc = TextCoprusProcessor(load_existing=True)
# proc.create_all_main_stats()
# query = TextCorpusQueryHandler()
# print(query.query_word_stats('AIDS is bad disease'))
# print(query.query_pos_tag_stats())
stats = TextCorpusStatsCreator(result_df=None, load_word_df=True)
stats.recount_auto_created_stats()
