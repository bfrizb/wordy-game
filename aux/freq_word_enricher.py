#!/usr/local/bin/python3

import argparse
import json
import logging
import re

""" Didn't work :/
from _word_lists.constant_word_lists import (DICT_WORDS_TO_REMOVE,
                                             FREQ_WORDS_TO_REMOVE,
                                             REPLACE_ARGS_FOR_DICT,
                                             WORD_TYPES_TO_SKIP)
"""

# ================= #
# CONSTANTS - START #
# ================= #
DEFAULT_TYPE_COUNT_MINIMUM = 100
DEFAULT_WORD_FREQ_LIST_PATH = (
    "/Users/bfrisbie/Downloads/_PERMANENT/wordy_game/google-10000-english.txt"
)
DEFAULT_WORD_DICT_PATH = "/Users/bfrisbie/Downloads/_PERMANENT/wordy_game/pg29765.txt"
DEFAULT_MIN_WORD_LENGTH = 3
FAILED_PARSE = "FAILED_PARSE"


FREQ_WORDS_TO_REMOVE = ["the", "aaa", "aam", "abc", "anti", "are", "may"]
DICT_WORDS_TO_REMOVE = [
    "DOES",
    "ETHNIC",
    "HOLDER",
    "ITS",
    "LIT",
    "NAM",
    "NAT",
    "NOT",
    "REDUCING",
]
WORD_TYPES_TO_SKIP = set(["conj.", "pron.", "prep."])

REPLACE_ARGS_FOR_DICT = (
    (
        "CONSOLATION GAME; CONSOLATION MATCH; CONSOLATION POT; CONSOLATION\nRACE\n",
        "",
        1,
    ),
    ('A*long". Etym', 'A*long", adv. Etym', 1),
    ('Bib`li*og"ra*phy n.;', 'Bib`li*og"ra*phy, n.;', 1),
    ("Broke (brok),", "Broke (brok), v.", 1),
    ('Cab"in v. i.', 'Cab"in, v. i.', 1),
    ('Can"dy n.', 'Can"dy, n.', 1),
    ('Car"di*ac n.', 'Car"di*ac, n.', 1),
    ('Cau"tion v. t.', 'Cau"tion, v. t.', 1),
    ("Crew (kr),", "Crew (kr), n.", 3),
    ("Crown (krn),", "Crown (krn), n.", 1),
    ("Cult (klt) n .", "Cult (klt), n.", 1),
    ("Duke n.", "Duke, n.", 1),
    ('E"ven n.', 'E"ven, n.', 1),
    ('E"vil n.', 'E"vil, n.', 1),
    ('Ex*clu"sive a. Etym', 'Ex*clu"sive, a. Etym', 1),
    ('Ex*cite"ment n.', 'Ex*cite"ment, n.', 1),
    ("Fail v. i. [imp.", "Fail, v. i. [imp.", 1),
    ("Gear v. t.", "Gear, v. t.", 1),
    ("Gem v. t.", "Gem, v. t.", 1),
    ("Heat, Etym", "Heat, n. Etym", 1),
    ("Hit adj.", "Hit, adj.", 1),
    ('Lei"sure n.', 'Lei"sure, n.', 1),
    ('Mak"er (mak"er) n.,', 'Mak"er (mak"er), n.,', 1),
    ('Med`i*ca"tion, Etym', 'Med`i*ca"tion, n. Etym', 1),
    ('Na"vy; n.;', 'Na"vy, n.;', 1),
    ('Me"sa, Etym', 'Me"sa, n. Etym, [Sp.]', 1),
    ('O"pen v. t.', 'O"pen, v. t.', 1),
    ('Oth"er conj. Etym', 'Oth"er, conj. Etym', 1),
    ('Ox"y*gen n.', 'Ox"y*gen, n.', 1),
    ('Par"tial*ly adv.', 'Par"tial*ly, adv.', 1),
    ("Peer v. t.", "Peer, v. t.", 2),
    ('Pro"ceed n.', 'Pro"ceed, n.', 1),
    ('Pro*ceed" v. i. [imp.', 'Pro*ceed", v. i. [imp.', 1),
    ("Pulled a.", "Pulled, a.", 1),
    ('Re*flect" v. i.', 'Re*flect", v. i.', 1),
    ('Re*main" n.', 'Re*main", n.', 1),
    ('Sal"a*ry v. t.', 'Sal"a*ry, v. t.', 1),
    ('Vis"it*or. Etym', 'Vis"it*or, n. Etym', 1),
    ('Wom"an n.;', 'Wom"an, n.;', 1),
)
# =============== #
# CONSTANTS - END #
# =============== #


class Word:
    def __init__(self, spelling):
        self.uppercase = spelling.upper()
        # `types` (below) is shorthand for "parts of speech" (e.g. noun, verb)
        self.types = None
        # `type_count` (below) is a way to measure how common a word's `types`
        # are in a corpus. For example, if (1) a corpus has 50 nouns, 30 verbs,
        # 20 adj, & 10 adverbs, and (2) a word has types noun & adjective, then
        # the type_count of that word is 70.
        self.type_count = 0
        self.qualifies = None

    def check_if_qualifies(self, type_count_min_qualify):
        if self.qualifies is not None:
            return self.qualifites

        self.qualifies = (
            self.types is not None
            and self.type_count >= type_count_min_qualify
            and len(WORD_TYPES_TO_SKIP.intersection(self.types)) == 0
        )
        return self.qualifies

    def __str__(self):
        answer = type(self).__name__ + "("
        for k, v in self.__dict__.items():
            answer += "{}: {}, ".format(k, v)
        return answer + ")"

    def __repl__(self):
        return self.__str__()


class Runner:
    def __init__(self, wfp, wdp, mwl, tcmq) -> None:
        self.min_word_length = mwl
        self.dict_contents = self._read_english_dict(wdp)
        self.words_by_freq = self._read_word_freq_file(wfp)
        self.type_count_min_qualify = tcmq

    def _read_word_freq_file(self, words_by_frequency_path):
        with open(words_by_frequency_path, "r") as fh:
            words_by_freq = []
            for line in fh.readlines():
                line = line.split(" #")[0].strip()
                if len(line.strip()) >= self.min_word_length:
                    words_by_freq.append(line)

        # Manually remove frequent/uninteresting words
        return [Word(w) for w in words_by_freq if w not in FREQ_WORDS_TO_REMOVE]

    def _read_english_dict(self, word_dictionary_path):
        with open(word_dictionary_path, "r") as fh:
            dict_contents = fh.read()

        for args in REPLACE_ARGS_FOR_DICT:
            dict_contents = dict_contents.replace(*args)
        return dict_contents

    def _map_word_to_types(self, words_alphabetized):
        i = 0
        next_line_has_type = False
        word_to_type_map = {}  #

        for line in self.dict_contents.split("\n"):
            if not line.strip():
                continue
            if next_line_has_type:
                # Below only applies to verb tenses, e.g.: Vis"it*ing,
                if " " not in line:
                    word_types = None
                    logging.debug("Skipping: {}".format(line))
                else:
                    if "Etym:" in line:
                        line = line.split("Etym:")[0]
                    # parse_line
                    re_results = re.search(", ([^[^E^(^)^;^,]+)", line)

                    if re_results and re_results.groups():
                        word_types = re_results.groups()[0].strip()
                    else:
                        word_types = FAILED_PARSE
                        logging.warning(
                            'Failed to parse line following "{}": {}'.format(
                                words_alphabetized[i], line
                            )
                        )

                if word_types:
                    if "&" in word_types:
                        word_types = (wt.strip() for wt in word_types.split("&"))
                    elif " or " in word_types:
                        word_types = (wt.strip() for wt in word_types.split(" or "))
                    else:
                        word_types = [word_types]

                    if words_alphabetized[i] not in word_to_type_map:
                        word_to_type_map[words_alphabetized[i]] = set(word_types)
                    else:
                        [
                            word_to_type_map[words_alphabetized[i]].add(wt)
                            for wt in word_types
                        ]
                next_line_has_type = False
            # A line in the dictionary indicates the start of a new word if it is in ALL CAPS
            elif (
                len(line) >= self.min_word_length
                and line[0].isalpha()
                and " " not in line
                and "." not in line
                and line.upper() == line
            ):  # Can make more efficient
                if line in DICT_WORDS_TO_REMOVE:
                    continue

                """
                logging.debug(
                    "{} > {} | {}".format(
                        line, words_alphabetized[i], line > words_alphabetized[i]
                    )
                )
                """
                # Case: words_alphabetized[i] not found :/
                while line > words_alphabetized[i]:
                    if words_alphabetized[i] not in word_to_type_map:
                        word_to_type_map[words_alphabetized[i]] = None
                    i += 1
                    if i >= len(words_alphabetized):
                        return word_to_type_map

                if words_alphabetized[i] == line:
                    next_line_has_type = True
                    continue
        return word_to_type_map

    def corpus_info(self, type_counts):
        logging.info("==================================================")
        logging.info("* Counts of Corpus Types (i.e. Parts of Speech)  *")
        logging.info("==================================================")
        logging.info(json.dumps(type_counts, indent=4))

        logging.info("=========================================")
        logging.info("* Word => Types (i.e. Parts of Speech)  *")
        logging.info("=========================================")
        # for w in self.words_by_freq:
        for w in self.words_by_freq[:100]:
            if w.qualifies:
                logging.info((w.uppercase, w.qualifies, w.types))
            else:
                logging.info("\t" + str((w.uppercase, w.qualifies, w.types)))

    def run(self):
        def get_type_counts(word_to_types_map):
            """See Word.__init__(...) for an explantion of `type_count`"""
            type_counts = {FAILED_PARSE: 0}
            for types in word_to_types_map.values():
                if not types:
                    continue
                for t in types:
                    if t == FAILED_PARSE:
                        continue
                    if t in type_counts:
                        type_counts[t] += 1
                    else:
                        type_counts[t] = 1
            return dict(sorted(type_counts.items(), key=lambda x: -x[1]))

        words_alphabetized = sorted([w.uppercase for w in self.words_by_freq])
        word_to_types_map = self._map_word_to_types(words_alphabetized)
        type_counts = get_type_counts(word_to_types_map)

        for word in self.words_by_freq:
            word.types = word_to_types_map.get(word.uppercase, None)
            if word.types:
                word.type_count = sum(type_counts[t] for t in word.types)
            word.check_if_qualifies(self.type_count_min_qualify)

        self.corpus_info(type_counts)


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-f",
        "--words_by_frequency_path",
        default=DEFAULT_WORD_FREQ_LIST_PATH,
        help="Path to a text file containing the english words, ordered descendingly "
        "by how frequently those words occur within a certain corpus",
    )
    parser.add_argument(
        "-d",
        "--word_dictionary_path",
        default=DEFAULT_WORD_DICT_PATH,
        help="Path to a text file a dictionary of english words including their parts "
        "of speech (e.g. noun, verb). NOTE: Must be in a very specific format!",
    )
    parser.add_argument(
        "-m",
        "--min_word_len",
        default=DEFAULT_MIN_WORD_LENGTH,
        help="Minimum length of words to include in the output",
    )
    parser.add_argument(
        "-t",
        "--type_count_min_needed_to_qualify",
        default=DEFAULT_TYPE_COUNT_MINIMUM,
        help="The minimum `type_count` value required for a `Word` to qualify",
    )
    return parser.parse_args()


def main():
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    args = parse_args()
    runner = Runner(
        args.words_by_frequency_path,
        args.word_dictionary_path,
        args.min_word_len,
        args.type_count_min_needed_to_qualify,
    )
    runner.run()


if __name__ == "__main__":
    main()
