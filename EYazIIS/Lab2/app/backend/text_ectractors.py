import pdfplumber as pdf
from io import StringIO
import docx2txt as dcx


class TextEctractor:

    @staticmethod
    def extract_text(file_bytes, file_type: str) -> str:
        if file_type == 'text/plain':
            return StringIO(file_bytes.getvalue().decode("utf-8"))
        elif file_type == 'application/pdf':
            with pdf.open(file_bytes) as file:
                return ''.join([page.extract_text() for page in file.pages])
        elif file_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return dcx.process(file_bytes)
        elif file_type == 'application/msword':            
            return StringIO(file_bytes.getvalue().decode("utf-8"))
        else:
            return 'Cannot proceed this file. Are you sure that such file type is supported?'                
