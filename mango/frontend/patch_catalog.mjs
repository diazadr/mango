import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/app/[locale]/(dashboard)/workspace/reservations/page.tsx';
const lines = readFileSync(filePath, 'utf8').split('\n');

// Lines to replace: 691–832 (0-indexed: 690–831)
const before = lines.slice(0, 690);
const after  = lines.slice(832);

const newBlock = `                ) : (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {filteredMachines.map((machine) => {
                      const isMine = isMineOf(machine);
                      return (
                        <div
                          key={machine.id}
                          className={\`overflow-hidden rounded-2xl border bg-card transition-all \${
                            isMine
                              ? "border-primary/40"
                              : "border-border/50 hover:border-primary/20"
                          }\`}
                        >
                          {/* Image */}
                          <div className="relative h-64 overflow-hidden bg-muted/20">
                            {machine.image_url || machine.image ? (
                              <img
                                src={machine.image_url || machine.image}
                                alt={machine.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Wrench className="h-12 w-12 text-muted-foreground/20" />
                              </div>
                            )}
                            {/* Mesin Saya badge */}
                            {isMine && (
                              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/70 via-transparent to-transparent p-4">
                                <span className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                                  <Boxes className="h-3.5 w-3.5" />
                                  Mesin Saya
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-5 p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="mb-2 flex items-center gap-2">
                                  <Badge variant="outline" className="rounded-lg">{machine.type}</Badge>
                                  <span className="text-xs text-muted-foreground">{machine.code}</span>
                                </div>
                                <h3 className="line-clamp-2 text-lg font-bold">{machine.name}</h3>
                              </div>
                              <div className="text-right">
                                <p className="text-[11px] text-muted-foreground">Sewa / Jam</p>
                                <p className="text-lg font-bold text-primary">{formatRp(machine.hourly_rate)}</p>
                              </div>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted">
                                {machine.owner?.logo_url ? (
                                  <img src={machine.owner.logo_url} alt="Owner" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-semibold text-muted-foreground">
                                    {machine.owner?.name?.charAt(0) || "U"}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground">
                                  {isMine ? "Kepemilikan" : "Penyedia"}
                                </p>
                                <p className="truncate text-sm font-semibold">
                                  {isMine ? "Milik Anda" : (machine.owner?.name || "Workshop")}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 text-primary" />
                              {machine.location || "Workshop"}
                            </div>

                            {isMine ? (
                              <>
                                <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
                                  <Boxes className="h-4 w-4 shrink-0 text-primary" />
                                  <p className="text-xs font-semibold text-primary">
                                    Ini adalah mesin milik Anda — tidak dapat direservasi sendiri.
                                  </p>
                                </div>
                                <Button
                                  disabled
                                  variant="outline"
                                  className="h-11 w-full cursor-not-allowed rounded-xl border-primary/30 font-semibold text-primary/50"
                                >
                                  Mesin Milik Anda
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => router.push(\`/workspace/reservations/\${machine.id}\`)}
                                className="h-11 w-full rounded-xl font-semibold"
                              >
                                Detail Mesin
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
`;

const result = [...before, ...newBlock.split('\n'), ...after].join('\n');
writeFileSync(filePath, result, 'utf8');
console.log('Patch applied successfully!');
