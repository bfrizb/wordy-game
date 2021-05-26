#!/usr/local/bin/python3
import argparse
import logging
import os
import re
from collections import Counter

# Free English Corpra:
#   * https://www.anc.org/data/oanc/download/


def process_file(fpath):
    with open(fpath) as fh:
        contents = fh.read()
    words = re.findall("[a-z]{3,50}", contents.lower())
    return Counter(words)


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "corpus_path", help="Folder containing text files composing the corpus"
    )
    return parser.parse_args()


def main():
    logging.basicConfig(level=logging.INFO)
    master_counter = Counter()
    args = parse_args()

    # TODO (P8): Parallelize this code (very inefficient!)
    for root, _, files in os.walk(args.corpus_path):
        for fname in files:
            if fname.lower().endswith(".txt"):
                fpath = os.path.join(root, fname)
                logging.debug("Processing: " + fpath)
                master_counter += process_file(fpath)

    with open("output.txt", "w") as fh:
        for c in master_counter.most_common():
            fh.write(c[0] + " # " + str(c[1]) + "\n")


if __name__ == "__main__":
    main()
