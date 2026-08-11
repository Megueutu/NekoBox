from __future__ import annotations

import json
import tempfile
from pathlib import Path
from unittest import TestCase
from unittest.mock import patch

from agents.tools import accessibility_tools


class AccessibilityToolsTests(TestCase):
    def _write_report(self, directory: Path, name: str, score: float, url: str = "https://nekobox.local/"):
        (directory / name).write_text(
            json.dumps(
                {
                    "categories": {"accessibility": {"score": score}},
                    "finalUrl": url,
                }
            ),
            encoding="utf-8",
        )

    def test_lighthouse_uses_median_of_three_reports(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            reports = Path(temporary_directory)
            self._write_report(reports, "one.json", 0.89)
            self._write_report(reports, "two.json", 0.91)
            self._write_report(reports, "three.json", 0.90)

            with patch.object(accessibility_tools, "_lighthouse_directories", return_value=[reports]):
                summary = accessibility_tools.get_lighthouse_accessibility_summary.invoke({})
                labels = accessibility_tools.get_accessibility_source_labels()

        self.assertIn("Página principal: notas", summary)
        self.assertIn("mediana 90", summary)
        self.assertIn("atende", summary)
        self.assertIn("Relatórios Lighthouse de acessibilidade", labels)
        self.assertTrue(all("/" not in label and "\\" not in label for label in labels))

    def test_lighthouse_reports_when_there_is_not_enough_evidence(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            reports = Path(temporary_directory)
            self._write_report(reports, "only-one.json", 0.95)

            with patch.object(accessibility_tools, "_lighthouse_directories", return_value=[reports]):
                summary = accessibility_tools.get_lighthouse_accessibility_summary.invoke({})

        self.assertIn("São necessárias 3 execuções", summary)
        self.assertNotIn("Pela regra de 90 pontos, atende", summary)
