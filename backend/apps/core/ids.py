"""Identificadores UUID v7 como texto (convención v3: «todos los identificadores son string»).

Python 3.14 trae uuid.uuid7(); en 3.13 se genera aquí según RFC 9562.
"""
import os
import time
import uuid


def uuid7() -> uuid.UUID:
    if hasattr(uuid, "uuid7"):
        return uuid.uuid7()
    ms = time.time_ns() // 1_000_000
    rand = int.from_bytes(os.urandom(10), "big")
    valor = (ms & ((1 << 48) - 1)) << 80
    valor |= 0x7 << 76  # versión
    valor |= ((rand >> 62) & 0xFFF) << 64  # rand_a (12 bits)
    valor |= 0b10 << 62  # variante
    valor |= rand & ((1 << 62) - 1)  # rand_b (62 bits)
    return uuid.UUID(int=valor)


def nuevo_id() -> str:
    return str(uuid7())
