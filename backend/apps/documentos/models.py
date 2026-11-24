"""Modelos ORM de Documento docente (común a Plan e Informe).

Pendiente: definir las tablas
    - documents
    - document_sections
    - activity_records
    - field_values
    - selected_options
    - document_versions
    - reviews
    - review_visits
    - observations
    - evidence

Heredar de apps.core.models.ModeloBase (id UUID v7 en texto) y, si tiene vigencia, ConVigencia.
"""
